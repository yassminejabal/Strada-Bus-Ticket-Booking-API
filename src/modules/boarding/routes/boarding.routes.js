import express from "express";

export default function createBoardingRoutes({
  boardingController,
  authMiddleware,
  validateBody,
  boardingValidationSchemas,
}) {
  const router = express.Router();

  router.post(
    "/departures/:id/boarding-records",
    authMiddleware.authenticate,
    authMiddleware.authorize("agent"),
    validateBody(boardingValidationSchemas.validateTicket),
    boardingController.validateTicket,
  );

  return router;
}
