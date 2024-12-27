const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  available: { type: Boolean, required: true },
  room_type: { type: String, required: true },
  duplicates: { type: Number, required: true }, // how many rooms there are of a certain type
  hotel_name: { type: String, ref: 'Hotel', required: true },
  num_booked: { type: Number, required: true }, // how many of those have been booked.

});

module.exports = mongoose.model('Room', roomSchema);
