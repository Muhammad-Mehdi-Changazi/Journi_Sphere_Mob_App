const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_type: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, required: true },
  duplicates: { type: Number, required: true },
  num_booked: { type: Number, required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }, // Reference back to Hotel
});

module.exports = mongoose.model('Room', roomSchema);
