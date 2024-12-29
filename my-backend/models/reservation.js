const mongoose = require('mongoose');

// Define the reservation schema
const reservationSchema = new mongoose.Schema({
    placeName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    roomType: { type: String, required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }, // Reference to Hotel
    createdAt: { type: Date, default: Date.now },  // Automatically add reservation timestamp
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
