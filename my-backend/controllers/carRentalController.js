const CarRentalCompany = require('../models/CarRental');

exports.createCarRentalCompany = async (req, res) => {
  try {
    const { name, location, contact_email, contact_phone, cars } = req.body;

    if (!name || !location || !location.address || !location.city || !Array.isArray(cars)) {
      return res.status(400).json({ error: 'Name, address, city, and cars are required.' });
    }

    const total_cars = cars.length;

    const newCompany = new CarRentalCompany({
      name,
      location: {
        address: location.address,
        city: location.city,
        coordinates: location.coordinates || {}
      },
      contact_email,
      contact_phone,
      total_cars,
      cars
    });

    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    console.error('Error creating car rental company:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
