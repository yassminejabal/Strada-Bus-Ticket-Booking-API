class ReservationsController {
  constructor({ reservationsService }) {
    this.reservationsService = reservationsService;
  }

  async bookSeat(req, res, next) {
    try {
      const { id: departureId } = req.params;
      const { seatNumber } = req.body;
      
      const booking = await this.reservationsService.bookSeat(departureId, seatNumber, req.user);
      
      res.status(201).json({ data: booking });
    } catch (error) {
      console.error("ERREUR RÉSERVATION :", error);
      next(error);
    }
  }
}

export default ReservationsController; 