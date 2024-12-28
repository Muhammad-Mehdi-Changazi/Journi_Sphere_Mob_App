const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  hotel_name: { type: String, required: true, unique: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  description: { type: String, required: true },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }], // Reference to Room schema
});

module.exports = mongoose.model('Hotel', hotelSchema);
