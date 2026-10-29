export default class BoardingController {
  constructor({ boardingService }) {
    this.boardingService = boardingService;
  }

  validateTicket = async (req, res, next) => {
    try {
      const departureId = req.params.id;
      const { ticketCode } = req.body;
      const agentId = req.user.userId;

      const record = await this.boardingService.validateTicket({
        departureId,
        ticketCode,
        agentId,
      });

      return res.status(201).json({
        data: {
          id: record._id,
          bookingId: record.bookingId,
          departureId: record.departureId,
          agentId: record.agentId,
          checkedAt: record.checkedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
