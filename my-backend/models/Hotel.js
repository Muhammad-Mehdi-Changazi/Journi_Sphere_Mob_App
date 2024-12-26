const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  hotel_name: { type: String, required: true, unique: true },
  location: { type: Object, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model('Hotel', hotelSchema);
