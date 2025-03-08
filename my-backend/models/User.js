const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    default: null
  },
  // ➡️ Add an array of itineraries referencing the Itinerary model
  itineraries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary'
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
