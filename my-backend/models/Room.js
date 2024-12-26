const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  available: { type: Boolean, required: true },
  room_type: { type: String, required: true },
  duplicates: { type: Number, required: true },
  hotel_name: { type: String, ref: 'Hotel', required: true },
});

module.exports = mongoose.model('Room', roomSchema);
