class BookingRepository {
  constructor({ BookingModel }) {
    this.BookingModel = BookingModel;
  }

  async create(bookingData, session) {
    const booking = new this.BookingModel(bookingData);
    return await booking.save({ session });
  }

  async findByPassenger(departureId, passengerId, session) {
    return await this.BookingModel.findOne({
      departureId,
      passengerId,
      status: { $in: ["CONFIRMED", "BOARDED"] },
    }).session(session);
  }

  // Récupérer les réservations d'un passager avec pagination
  async findByPassengerId(passengerId, page = 1, limit = 20, session = null) {
    const skip = (page - 1) * limit;
    const query = this.BookingModel.find({ passengerId })
      .sort({ createdAt: -1 }) // Les plus récentes d'abord
      .skip(skip)
      .limit(limit);

    if (session) query.session(session);
    return await query.exec();
  }

  // Compter le nombre total pour la pagination
  async countByPassengerId(passengerId) {
    return await this.BookingModel.countDocuments({ passengerId });
  }

  // Récupérer une réservation par son ID
  async findById(bookingId, session = null) {
    const query = this.BookingModel.findById(bookingId);
    if (session) query.session(session);
    return await query.exec();
  }
  async updateStatus(bookingId, status, cancelReason = null, session = null) {
    const query = this.BookingModel.findByIdAndUpdate(
      bookingId,
      { status, cancelReason },
      { new: true }, 
    );
    if (session) query.session(session);
    return await query.exec();
  }
}

export default BookingRepository;
