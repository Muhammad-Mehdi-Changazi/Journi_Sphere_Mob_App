const CarRentalCompany = require('../models/CarRental');
const CarReservation = require('../models/CarReservation');
const User = require('../models/User');

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

exports.getCompanyDetails = async (req, res) => {
    try {
        const company = await CarRentalCompany.findById(req.params.id);
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_email,
      contact_phone,
      location,
      cars,
      total_cars
    } = req.body;

    const updatedCompany = await CarRentalCompany.findByIdAndUpdate(
      id,
      {
        name,
        contact_email,
        contact_phone,
        location,
        cars,
        total_cars
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.bookCar = async (req, res) => {
  try {
    const {
      cnic,
      contactNumber,
      fromDate,
      endDate,
      registrationNumber,
      rentCarCompanyId,
      userEmail
    } = req.body;

    const company = await CarRentalCompany.findById(rentCarCompanyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const car = company.cars.find(car => car.registration_number === registrationNumber);
    if (!car || !car.available) return res.status(400).json({ message: 'Car not available' });

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Reserve the car
    car.available = false;
    await company.save();

    const reservation = new CarReservation({
      cnic,
      contactNumber,
      fromDate,
      endDate,
      carModel: car.model,
      registrationNumber,
      rentCarCompany: company._id,
      user: user._id
    });

    await reservation.save();
    res.status(200).json({ message: 'Car booked successfully', reservation });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Booking failed', error });
  }
};