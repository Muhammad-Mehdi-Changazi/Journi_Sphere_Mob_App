const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  hotel_name: { type: String, required: true, unique: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  city: { type: String, required: true },
  complete_address: { type: String, required: true },
  room_types: { type: [String], required: true }, // Array of strings for room types
  number_of_rooms: { type: Number, required: true },
  hotel_class: { type: String, required: true }, // e.g., "5 star"
  functional: { type: Boolean, required: true },
  mess_included: { type: Boolean, required: true },
});

// Prevent overwriting the model if already compiled
module.exports = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
