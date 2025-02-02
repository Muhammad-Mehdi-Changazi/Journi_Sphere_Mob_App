const mongoose = require('mongoose');

// Define the reservation schema
const reservationSchema = new mongoose.Schema({
    hotel_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }, // Foreign key to Hotel
    room_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },  // Foreign key to Room
    customer_name: { type: String, required: true }, // Name of the customer
    CNIC: { type: String, required: true }, // CNIC of the customer
    phone_number: { type: String, required: true }, // Phone number of the customer
    email: { type: String, required: true }, // Email of the customer
    reservation_date: { // Reservation date range
        from: { type: Date, required: true }, // Start date of the reservation
        to: { type: Date, required: true },   // End date of the reservation
    },
    paymentMethod: {
        type: String,
        enum: ["ONLINE", "OTHERS"],
        required: true
    }, // Payment method field
    reservationStatus: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
        default: "PENDING"
    }, // Reservation status
    createdAt: { type: Date, default: Date.now }, // Automatically add reservation timestamp
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
