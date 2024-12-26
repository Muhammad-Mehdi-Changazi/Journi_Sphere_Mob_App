const City = require('../models/city'); 

exports.getCities = async (req, res) => {
  try {
    const cities = await City.find(); // Fetch all cities
    res.json(cities); // Return the data with new fields
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).send('Server error');
  }
};
