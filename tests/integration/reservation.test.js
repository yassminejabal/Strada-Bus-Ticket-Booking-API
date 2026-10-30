import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { asValue } from "awilix";
import app from "../../src/app.js";
import { container } from "../../src/bootstrap/container.js";
import BookingModel from "../../src/modules/reservations/models/booking.model.js";
import jwt from "jsonwebtoken";
process.env.JWT_SECRET = 'fallback_secret'; 
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
    transactionRunner: asValue({
      run: async (callback) => callback(null),
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

describe("US-14 & US-15 : Réservation de place", () => {
  it("devrait réserver une place avec succès (201)", async () => {
    // On génère un token pour un passager
    const token = getTestToken();

    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`) 
      .send({ seatNumber: 2 });

    expect(response.status).toBe(201);
    expect(response.body.data.seatNumber).toBe(2);
    expect(response.body.data.status).toBe("CONFIRMED");

    const bookingInDb = await BookingModel.findOne({ seatNumber: 2 });
    expect(bookingInDb).not.toBeNull();
    expect(bookingInDb.ticketCode).toBeDefined();
  });

  it("devrait refuser la réservation si le siège est déjà pris (409)", async () => {
    // Premier passager (Token 1)
    const token1 = getTestToken();
    await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token1}`) 
      .send({ seatNumber: 3 });

    // Deuxième passager (Token 2 - différent)
    const token2 = getTestToken();
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token2}`) 
      .send({ seatNumber: 3 });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("SEAT_UNAVAILABLE");
  });

  it("devrait empêcher un même passager de réserver deux sièges différents (409)", async () => {
    // On crée UN SEUL token pour simuler le même passager
    const passengerId = new mongoose.Types.ObjectId().toString();
    const token = getTestToken(passengerId);

    // 1ère réservation
    const res1 = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`) 
      .send({ seatNumber: 1 });

    expect(res1.status).toBe(201);

    // 2ème réservation (autre siège, même token)
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .set("Authorization", `Bearer ${token}`) 
      .send({ seatNumber: 2 });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("ALREADY_BOOKED");
  });

  it(" TEST CONCURRENCE : ne doit attribuer le siège qu'à une seule requête", async () => {
    // 2 passagers différents pour le test de concurrence
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
});
