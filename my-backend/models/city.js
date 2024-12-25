const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: String,
  country: String,
  lat: Number,
  lng: Number,
});

const City = mongoose.model('City', citySchema, 'city')
module.exports = City;