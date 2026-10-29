import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { asValue } from 'awilix';
import app from '../../src/app.js';
import { container } from '../../src/bootstrap/container.js';
import BookingModel from '../../src/modules/reservations/models/booking.model.js';

let mongoServer;
const FAKE_DEPARTURE_ID = '507f1f77bcf86cd799439011'; // ObjectId valide pour MongoDB

// ==========================================
// SETUP GLOBAL DU TEST (Exécuté une seule fois)
// ==========================================
beforeAll(async () => {
  // 1. On démarre une fausse base MongoDB en mémoire.
  // ⚠️ CRUCIAL : On utilise MongoMemoryReplSet (et non MongoMemoryServer) 
  // car les transactions MongoDB nécessitent un Replica Set.
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // 2. On surcharge les dépendances non prêtes via Awilix (Injection de Dépendances)
  // On remplace le faux CatalogueApi de register-modules par un qui renvoie des données valides.
  container.register({
    catalogueApi: asValue({
      getDepartureForBooking: async () => ({
        status: 'OPEN',
        departureAt: new Date(Date.now() + 10000000), // Date future
        seatPlan: [1, 2, 3, 4],
        fareCents: 5000
      })
    }),
    // On remplace le transactionRunner par un faux pour éviter de bloquer le test
    transactionRunner: asValue({
      run: async (callback) => callback(null) 
    }),
    clock: asValue({ now: () => new Date() }),
    identityApi: asValue({})
  });
});

// Nettoyage final après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Nettoyage entre chaque test pour garantir l'isolation (éviter que les tests s'influencent)
afterEach(async () => {
  await BookingModel.deleteMany({});
});

// ==========================================
// LES CAS DE TEST
// ==========================================
describe('US-14 : Réservation de place (Intégration)', () => {
  
  it('devrait réserver une place avec succès (201)', async () => {
    // On simule une requête HTTP POST via Supertest
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .send({ seatNumber: 2 });

    // Vérifications de la réponse HTTP
    expect(response.status).toBe(201);
    expect(response.body.data.seatNumber).toBe(2);
    expect(response.body.data.status).toBe('CONFIRMED');
    
    // Preuve d'intégration : on vérifie directement dans la base MongoDB
    const bookingInDb = await BookingModel.findOne({ seatNumber: 2 });
    expect(bookingInDb).not.toBeNull();
    expect(bookingInDb.ticketCode).toBeDefined();
  });

  it('devrait refuser la réservation si le siège est déjà pris (409)', async () => {
    // 1. Le premier passager réserve le siège 3
    await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .send({ seatNumber: 3 });

    // 2. Le deuxième passager tente de réserver le même siège
    const response = await request(app)
      .post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`)
      .send({ seatNumber: 3 });

    // Vérification du conflit
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('SEAT_UNAVAILABLE');
  });

  it('🔥 TEST CONCURRENCE : ne doit attribuer le siège qu\'à une seule requête', async () => {
    // ⚠️ C'EST LE TEST LE PLUS IMPORTANT DU BRIEF ⚠️
    // On lance 2 requêtes EXACTEMENT en même temps avec Promise.all()
    const [res1, res2] = await Promise.all([
      request(app).post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`).send({ seatNumber: 4 }),
      request(app).post(`/api/v1/departures/${FAKE_DEPARTURE_ID}/bookings`).send({ seatNumber: 4 })
    ]);

    // On s'attend à avoir une réussite (201) et un échec (409)
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);

    // Preuve absolue : une seule réservation doit exister en base pour ce siège
    const bookings = await BookingModel.find({ seatNumber: 4, status: 'CONFIRMED' });
    expect(bookings.length).toBe(1);
  });
});