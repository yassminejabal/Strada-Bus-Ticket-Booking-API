import mongoose from "mongoose";

const BoardingRecordSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    departureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departure",
      required: true,
      index: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const BoardingRecord = mongoose.model(
  "BoardingRecord",
  BoardingRecordSchema,
);
export default BoardingRecord;
