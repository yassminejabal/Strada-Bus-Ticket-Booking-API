import { ConflictError } from "../../../shared/errors.js";

export default class BoardingService {
  constructor({
    boardingRepository,
    reservationsApi,
    catalogueApi,
    clock,
    transactionRunner,
  }) {
    this.boardingRepository = boardingRepository;
    this.reservationsApi = reservationsApi;
    this.catalogueApi = catalogueApi;
    this.clock = clock;
    this.transactionRunner = transactionRunner;
  }

  async validateTicket({ departureId, ticketCode, agentId }) {
    return this.transactionRunner.run(async (session) => {
      const departure = await this.catalogueApi.getDeparture(departureId, {
        session,
      });
      if (departure.status !== "BOARDING") {
        throw new ConflictError(
          "Boarding is not open for this departure",
          "BOARDING_CLOSED",
        );
      }

      const checkedAt = this.clock.now();

      const booking = await this.reservationsApi.consumeTicket({
        ticketCode,
        departureId,
        checkedAt,
        session,
      });

      const boardingRecord = await this.boardingRepository.create(
        {
          bookingId: booking._id,
          departureId,
          agentId,
          checkedAt,
        },
        { session },
      );

      return boardingRecord;
    });
  }
}
