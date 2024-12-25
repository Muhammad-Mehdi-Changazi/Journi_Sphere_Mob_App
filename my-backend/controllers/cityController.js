const City = require('../models/city'); 

exports.getCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (error) {
    res.status(500).send('Error fetching cities');
  }
};
