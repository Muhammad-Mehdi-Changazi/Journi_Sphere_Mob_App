// models/Itinerary.js
const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  username: { // Changed field from 'user' (ObjectId) to 'username' (String)
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);
