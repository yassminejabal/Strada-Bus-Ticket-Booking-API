import express from "express";
import { authenticate } from "../../../middlewares/authenticate.js";
import { authorize } from "../../../middlewares/authorize.js";
const router = express.Router();

export default (container) => {
  const controller = container.resolve("reservationsController");
  router.post(
    "/departures/:id/bookings",
    authenticate,
    authorize("passenger"),
    (req, res, next) => {
      const controller = container.resolve("reservationsController");
      return controller.bookSeat(req, res, next);
    },
  );
  router.get(
    "/bookings",
    authenticate,
    authorize("passenger", "admin"),
    (req, res, next) => controller.getMyBookings(req, res, next),
  );
  router.get(
    "/bookings/:id",
    authenticate,
    authorize("passenger", "admin"),
    (req, res, next) => controller.getBookingById(req, res, next),
  );
  router.post(
    "/bookings/:id/cancel",
    authenticate,
    authorize("passenger"),
    (req, res, next) => controller.cancelBooking(req, res, next),
  );

  return router;
};
