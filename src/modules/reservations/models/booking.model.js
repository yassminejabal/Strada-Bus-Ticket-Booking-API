const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    departureId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Departure",
    },
    seatNumber: { type: Number, required: true, min: 1 },
    passengerName: { type: String, required: true },
    priceCents: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "BOARDED"],
      default: "CONFIRMED",
    },
    ticketCode: { type: String, required: true, unique: true },
    cancelReason: {
      type: String,
      enum: ["CUSTOMER", "DEPARTURE"],
      default: null,
    },
    boardedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// 🔒 INVARIANT 1 : Empêcher 2 réservations actives sur le même siège
bookingSchema.index(
  { departureId: 1, seatNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["CONFIRMED", "BOARDED"] } },
  },
);

// 🔒 Empêcher 1 passager de réserver 2 fois le même départ
bookingSchema.index(
  { departureId: 1, passengerId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["CONFIRMED", "BOARDED"] } },
  },
);
const BookingModel = mongoose.model('Booking', bookingSchema);
export default BookingModel; 