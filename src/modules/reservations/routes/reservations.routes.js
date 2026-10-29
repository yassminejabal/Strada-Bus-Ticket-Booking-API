import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

//  MIDDLEWARE TEMPORAIRE 
const fakeAuthPassenger = (req, res, next) => {
  req.user = {
    userId: new mongoose.Types.ObjectId().toString(),
    role: 'passenger',
    fullName: 'Achraf Test Passenger'
  };
  next();
};

export default (container) => {
  router.post(
    '/departures/:id/bookings',
    fakeAuthPassenger,
    (req, res, next) => {
      const controller = container.resolve('reservationsController');
      return controller.bookSeat(req, res, next);
    }
  );

  return router;
};