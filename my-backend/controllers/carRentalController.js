const CarRentalCompany = require('../models/CarRental');

// Add a new car to the company's embedded cars array
exports.addCar = async (req, res) => {
  const { model, type, registration_number, available, rent_per_day, companyId } = req.body;

  try {
    const company = await CarRentalCompany.findById(companyId);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if a car with the same registration number already exists
    const existingCar = company.cars.find(car => car.registration_number === registration_number);
    if (existingCar) {
      return res.status(400).json({ error: 'Car with this registration number already exists' });
    }

    // Add new car to embedded array
    company.cars.push({
      model,
      type,
      registration_number,
      available,
      rent_per_day
    });

    company.total_cars = company.cars.length;

    await company.save();

    res.status(201).json({ message: 'Car added successfully', car: company.cars[company.cars.length - 1] });
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a car in the embedded cars array by registration_number
exports.updateCar = async (req, res) => {
  const { registration_number } = req.params;
  const updateData = req.body;

  try {
    const company = await CarRentalCompany.findOne({ 'cars.registration_number': registration_number });

    if (!company) {
      return res.status(404).json({ error: 'Car not found in any company' });
    }

    const car = company.cars.find(car => car.registration_number === registration_number);

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Update fields manually
    car.model = updateData.model || car.model;
    car.type = updateData.type || car.type;
    car.available = typeof updateData.available === 'boolean' ? updateData.available : car.available;
    car.rent_per_day = updateData.rent_per_day || car.rent_per_day;

    await company.save();

    res.json({ message: 'Car updated successfully', car });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


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


exports.getCompanyDetails = async (req, res) => {
    try {
        const company = await CarRentalCompany.findById(req.params.id);
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
