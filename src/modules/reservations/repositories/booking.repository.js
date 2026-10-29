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
      status: { $in: ['CONFIRMED', 'BOARDED'] } 
    }).session(session);
  }
}

export default BookingRepository; 