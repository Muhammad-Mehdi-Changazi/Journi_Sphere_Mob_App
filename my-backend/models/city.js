const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true }, // Added country field
  lat: { type: Number, required: true },     // Added latitude field
  lng: { type: Number, required: true },     // Added longitude field
  photoUrl: { type: String, required: false }, // Existing field
  description: { type: String, required: false }, // Existing field
  places: { type: [String], required: false },
  food: { type: [String], required: false }
});

const City = mongoose.model('City', citySchema, 'city'); // Collection name is 'city'
module.exports = City;
