const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  model: { type: String, required: true },
  registration_number: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g., SUV, Sedan, etc.
  rent_per_day: { type: Number, required: true },
  available: { type: Boolean, default: true },
  url: { type: String, default: 'https://via.placeholder.com/400x300?text=Car+Image' }
});

const CarRentalCompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  contact_email: { type: String },
  contact_phone: { type: String },
  total_cars: { type: Number },
  cars: [CarSchema], // Embedded documents for each car
  url:  { type: String, default: 'https://via.placeholder.com/400x300?text=Car+Image' }, 

});

module.exports = mongoose.model('CarRentalCompany', CarRentalCompanySchema);
