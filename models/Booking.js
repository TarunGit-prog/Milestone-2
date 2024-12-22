const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  showtimeIndex: { type: Number, required: true },
  seat: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
  },
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
