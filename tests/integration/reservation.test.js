import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  jest,
} from "@jest/globals"; 
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { asValue } from "awilix";
import app from "../../src/app.js";
import { container } from "../../src/bootstrap/container.js";
import BookingModel from "../../src/modules/reservations/models/booking.model.js";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "fallback_secret";

const getTestToken = (userId = new mongoose.Types.ObjectId().toString()) => {
  return jwt.sign(
    { userId, role: "passenger", fullName: "Achraf Test" },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" },
  );
};

let mongoServer;
const FAKE_DEPARTURE_ID = "507f1f77bcf86cd799439011";

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  container.register({
    catalogueApi: asValue({
      getDepartureForBooking: async () => ({
        status: "OPEN",
        departureAt: new Date(Date.now() + 10000000),
        seatPlan: [1, 2, 3, 4],
        fareCents: 5000,
      }),
    }),
    clock: asValue({ now: () => new Date() }),
    identityApi: asValue({}),
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await BookingModel.deleteMany({});
});

describe("US-14 à US-19 : Réservations", () => {
  it("devrait réserver une place avec succès (201)", async () => {
    const token = getTestToken();
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ seatNumber: 2 });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("CONFIRMED");

    const bookingInDb = await BookingModel.findOne({ seatNumber: 2 });
    expect(bookingInDb).not.toBeNull();
  });

  it("devrait refuser la réservation si le siège est déjà pris (409)", async () => {
    const token1 = getTestToken();
    await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token1}`)
      .send({ seatNumber: 3 });

    const token2 = getTestToken();
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ seatNumber: 3 });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("SEAT_UNAVAILABLE");
  });

  it("devrait empêcher un même passager de réserver deux sièges différents (409)", async () => {
    const passengerId = new mongoose.Types.ObjectId().toString();
    const token = getTestToken(passengerId);

    await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ seatNumber: 1 });
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ seatNumber: 2 });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("ALREADY_BOOKED");
  });

  it("🔥 TEST CONCURRENCE : ne doit attribuer le siège qu'à une seule requête", async () => {
    const token1 = getTestToken();
    const token2 = getTestToken();

    const [res1, res2] = await Promise.all([
      request(app)
        .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
        .set("Authorization", `Bearer ${token1}`)
        .send({ seatNumber: 4 }),
      request(app)
        .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ seatNumber: 4 }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);

    const bookings = await BookingModel.find({
      seatNumber: 4,
      status: "CONFIRMED",
    });
    expect(bookings.length).toBe(1);
  });

  it("US-18 : devrait annuler toutes les réservations d'un départ", async () => {
    const token = getTestToken();
    await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ seatNumber: 1 });

    const reservationsService = container.resolve("reservationsService");

    container.register({
      reservationsApi: asValue({
        cancelAllBookingsForDeparture: async (id, session) => {
          return await reservationsService.cancelAllBookingsForDeparture(
            id,
            session,
          );
        },
      }),
      catalogueApi: asValue({
        cancelDeparture: async (id, user, session) => ({
          id,
          status: "CANCELLED",
        }),
      }),
    });

    const cancelDepartureService = container.resolve("cancelDepartureService");
    await cancelDepartureService.execute(FAKE_DEPARTURE_ID, {
      userId: "admin",
      role: "admin",
    });

    const bookings = await BookingModel.find({
      departureId: FAKE_DEPARTURE_ID,
    });
    expect(bookings[0].status).toBe("CANCELLED");
    expect(bookings[0].cancelReason).toBe("DEPARTURE");
  });

  it("US-19 : ROLLBACK - ne doit rien sauvegarder en cas d'échec", async () => {
    const bookingRepository = container.resolve("bookingRepository");

    //Simule un crash du serveur juste avant la validation en base
    const spy = jest
      .spyOn(bookingRepository, "create")
      .mockRejectedValueOnce(new Error("Erreur simulée de la base de données"));

    const token = getTestToken();
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ seatNumber: 3 });

    expect(response.status).toBe(500);

    //  PREUVE DU ROLLBACK
    const bookings = await BookingModel.find({ seatNumber: 3 });
    expect(bookings.length).toBe(0);

    spy.mockRestore();
  });
});
