const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_type: { type: String, required: true },
  room_number: { type: Number, required: true, unique: true },
  hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  rent: { type: Number, required: true },
  available: { type: Boolean, required: true },
  bed_size: { type: String, required: true },
});

module.exports = mongoose.model('Room', roomSchema);
