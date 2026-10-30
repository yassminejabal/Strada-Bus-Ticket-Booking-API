import { asClass, asValue, asFunction } from "awilix";
import { randomUUID } from "crypto";
import BookingModel from "../modules/reservations/models/booking.model.js";
import BookingRepository from "../modules/reservations/repositories/booking.repository.js";
import ReservationsService from "../modules/reservations/services/reservations.service.js";
import ReservationsController from "../modules/reservations/controllers/reservations.controller.js";
import AuthController from '../modules/identity/controllers/auth.controller.js';
import AuthService from '../modules/identity/services/auth.service.js';
import UserRepository from '../modules/identity/repositories/user.repository.js';
import UserModel from '../modules/identity/models/user.model.js'; 
const injectable = {
  authController: asClass(AuthController).singleton(), 
  authService: asClass(AuthService).singleton(),
  userRepository: asClass(UserRepository).singleton(),
  BookingModel: asValue(BookingModel),
  UserModel: asValue(UserModel), 
  bookingRepository: asClass(BookingRepository).singleton(),
  reservationsService: asClass(ReservationsService).singleton(),
  reservationsController: asClass(ReservationsController).singleton(),
  // DÉPENDANCES TEMPORAIRES
  catalogueApi: asValue({
    getDepartureForBooking: async () => ({
      status: "OPEN",
      departureAt: new Date(Date.now() + 10000000),
      seatPlan: [1, 2, 3, 4],
      fareCents: 5000,
    }),
  }),
  // Fausse horloge
  clock: asValue({ now: () => new Date() }),
  // Faux transactionRunner (qui exécute juste la fonction)
  transactionRunner: asValue({
    run: async (callback) => callback(null), // On passe null au lieu d'une vraie session Mongo
  }),
  // Faux IdentityApi
  identityApi: asValue({
    getCurrentUser: async () => ({}),
  }),
  // Générateur de code
  ticketCodeGenerator: asValue(() => randomUUID()),
};

export default injectable;
