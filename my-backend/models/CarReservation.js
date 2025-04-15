const mongoose = require('mongoose');

const CarReservationSchema = new mongoose.Schema({
  cnic: { type: String, required: true },
  contactNumber: { type: String, required: true },
  fromDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  carModel: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  paymentMethod: {
          type: String,
          enum: ["ONLINE", "OTHERS"],
          required: true
      }, // Payment method field

  reservationStatus: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "CANCELLED"],
        default: "PENDING"
    },
  rentCarCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarRentalCompany',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CarReservation', CarReservationSchema);
