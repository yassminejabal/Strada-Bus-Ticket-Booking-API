export default class BoardingRepository {
  constructor({ boardingRecordModel }) {
    this.model = boardingRecordModel;
  }

  async create(data, { session } = {}) {
    const [record] = await this.model.create([data], { session });
    return record;
  }

  async findByBookingId(bookingId, { session } = {}) {
    return this.model.findOne({ bookingId }).session(session);
  }

  async findByDepartureId(departureId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.model
        .find({ departureId })
        .sort({ checkedAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments({ departureId }),
    ]);
    return { records, total, page, limit };
  }
}
