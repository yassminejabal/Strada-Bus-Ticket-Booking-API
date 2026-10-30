class ReservationsService {
  constructor({
    bookingRepository,
    catalogueApi,
    clock,
    transactionRunner,
    ticketCodeGenerator,
    identityApi,
  }) {
    this.bookingRepository = bookingRepository;
    this.catalogueApi = catalogueApi;
    this.clock = clock;
    this.transactionRunner = transactionRunner;
    this.ticketCodeGenerator = ticketCodeGenerator;
    this.identityApi = identityApi;
  }

  async bookSeat(departureId, seatNumber, userContext) {
    return await this.transactionRunner.run(async (session) => {
      // Récupérer le départ via le contrat public de Catalogue (avec la session)
      const departure = await this.catalogueApi.getDepartureForBooking(
        departureId,
        session,
      );

      // Vérifier que le départ est OPEN et futur
      if (
        departure.status !== "OPEN" ||
        new Date(departure.departureAt) <= this.clock.now()
      ) {
        const error = new Error("Départ non réservable");
        error.code = "DEPARTURE_NOT_BOOKABLE";
        error.status = 409;
        throw error;
      }

      // Vérifier que le siège existe dans le plan figé du départ
      if (!departure.seatPlan.includes(seatNumber)) {
        const error = new Error("Siège inexistant");
        error.code = "SEAT_NOT_IN_PLAN";
        error.status = 400;
        throw error;
      }

      // Vérifier si le passager a déjà réservé (sécurité avant l'index unique)
      const existingPassengerBooking =
        await this.bookingRepository.findByPassenger(
          departureId,
          userContext.userId,
          session,
        );
      if (existingPassengerBooking) {
        const error = new Error("Déjà réservé");
        error.code = "ALREADY_BOOKED";
        error.status = 409;
        throw error;
      }

      // Générer le code du billet
      const ticketCode = this.ticketCodeGenerator();

      // Créer la réservation
      const bookingData = {
        passengerId: userContext.userId,
        departureId: departureId,
        seatNumber: seatNumber,
        passengerName: userContext.fullName,
        priceCents: departure.fareCents,
        ticketCode: ticketCode,
        status: "CONFIRMED",
      };

      try {
        const booking = await this.bookingRepository.create(
          bookingData,
          session,
        );
        return booking;
      } catch (error) {
        if (error.code === 11000) {
          const conflictError = new Error("Ce siege est deja reserve.");
          conflictError.code = error.keyPattern.seatNumber
            ? "SEAT_UNAVAILABLE"
            : "ALREADY_BOOKED";
          conflictError.status = 409;
          throw conflictError;
        }
        throw error;
      }
    });
  }
  // Lister les réservations (Pagination)
  async getMyBookings(userContext, page = 1, limit = 20) {
    const queryFilter =
      userContext.role === "admin" ? {} : { passengerId: userContext.userId };

    // On récupère les données
    const bookings = await this.bookingRepository.findByPassengerId(
      userContext.userId,
      page,
      limit,
    );
    const total = await this.bookingRepository.countByPassengerId(
      userContext.userId,
    );

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  // Voir le détail
  async getBookingDetails(bookingId, userContext) {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      const error = new Error("Réservation introuvable");
      error.code = "RESOURCE_NOT_FOUND";
      error.status = 404;
      throw error;
    }

    if (
      booking.passengerId.toString() !== userContext.userId &&
      userContext.role !== "admin"
    ) {
      const error = new Error("Réservation introuvable");
      error.code = "RESOURCE_NOT_FOUND";
      error.status = 404;
      throw error;
    }

    return booking;
  }

  async cancelBooking(bookingId, userContext) {
    return await this.transactionRunner.run(async (session) => {
      const booking = await this.bookingRepository.findById(bookingId, session);

      if (!booking || booking.passengerId.toString() !== userContext.userId) {
        const error = new Error("Réservation introuvable");
        error.code = "RESOURCE_NOT_FOUND";
        error.status = 404;
        throw error;
      }

      if (booking.status !== "CONFIRMED") {
        const error = new Error("Cette réservation ne peut plus être annulée.");
        error.code = "BOOKING_NOT_CANCELLABLE";
        error.status = 409;
        throw error;
      }

      const departure = await this.catalogueApi.getDepartureForBooking(
        booking.departureId,
        session,
      );

      if (!departure || departure.status !== "OPEN") {
        const error = new Error("Le départ n'est plus ouvert à l'annulation.");
        error.code = "BOOKING_NOT_CANCELLABLE";
        error.status = 409;
        throw error;
      }

      return await this.bookingRepository.updateStatus(
        bookingId,
        "CANCELLED",
        "CUSTOMER",
        session,
      );
    });
  }
}

export default ReservationsService;
