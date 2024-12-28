const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_type: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, required: true },
  duplicates: { type: Number, required: true }, // Number of rooms available for this type
  num_booked: { type: Number, required: true }, // Number of booked rooms
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }, // Reference to Hotel schema
});

module.exports = mongoose.model('Room', roomSchema);
