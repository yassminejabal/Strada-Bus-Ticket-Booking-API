export default class CancelDepartureService {
  constructor({ catalogueApi, reservationsApi, transactionRunner }) {
    this.catalogueApi = catalogueApi;
    this.reservationsApi = reservationsApi;
    this.transactionRunner = transactionRunner;
  }

  async execute(departureId, adminUser) {
    return await this.transactionRunner.run(async (session) => {
      const departure = await this.catalogueApi.cancelDeparture(
        departureId,
        adminUser,
        session,
      );
      await this.reservationsApi.cancelAllBookingsForDeparture(
        departureId,
        session,
      );

      return departure;
    });
  }
}
