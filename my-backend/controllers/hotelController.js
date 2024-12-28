const Hotel = require('../models/Hotel');

// Create a new hotel
exports.createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json({
      message: 'Hotel created successfully',
      hotel,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all hotels
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json({
      message: 'Hotels fetched successfully',
      hotels,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getHotelByName = async (req, res) => {
  try {
    let { placeName } = req.params; 
    placeName = placeName.trim().replace(/\r?\n|\r/g, '');

    const hotel = await Hotel.findOne({ hotel_name: placeName }).populate('rooms'); // This should populate the rooms correctly


    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    res.status(200).json({
      message: 'Hotel fetched successfully',
      hotel,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






exports.getHotelByUsername = async (req, res) => {
  try {
    const { username } = req.params; // Retrieve username from URL parameters
    const hotel = await Hotel.findOne({ hotel_name: username }); // Query by hotel_name

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found for the given username' });
    }

    res.status(200).json({
      message: 'Hotel fetched successfully',
      hotel,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
