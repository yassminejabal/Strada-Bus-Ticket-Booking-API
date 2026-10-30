class ReservationsController {
  constructor({ reservationsService }) {
    this.reservationsService = reservationsService;
  }

  async bookSeat(req, res, next) {
    try {
      const { id: departureId } = req.params;
      const { seatNumber } = req.body;

      const booking = await this.reservationsService.bookSeat(
        departureId,
        seatNumber,
        req.user,
      );

      res.status(201).json({ data: booking });
    } catch (error) {
      console.error("ERREUR RÉSERVATION :", error);
      next(error);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100

      const result = await this.reservationsService.getMyBookings(
        req.user,
        page,
        limit,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await this.reservationsService.getBookingDetails(
        id,
        req.user,
      );
      res.status(200).json({ data: booking });
    } catch (error) {
      next(error);
    }
  }
}

export default ReservationsController;
