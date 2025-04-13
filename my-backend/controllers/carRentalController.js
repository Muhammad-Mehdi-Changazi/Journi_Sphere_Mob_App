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

exports.getCarRentalCompaniesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    console.log("Fetching car rentals for city:", city);
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required.' });
    }
    
    // Make the query case-insensitive
    const companies = await CarRentalCompany.find({ 
      'location.city': { $regex: new RegExp(city, 'i') } 
    });
    
    console.log(`Found ${companies.length} companies for city ${city}`);
    
    // Return empty array instead of 404 if no companies found
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching car rental companies:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCarRentalCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Company ID is required.' });
    }
    
    const company = await CarRentalCompany.findById(id);
    
    if (!company) {
      return res.status(404).json({ error: 'Car rental company not found.' });
    }
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching car rental company:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.testCarRentalEndpoint = async (req, res) => {
  try {
    res.status(200).json({ message: "Car rental endpoint is working" });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
};