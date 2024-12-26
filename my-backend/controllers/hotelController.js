const Hotel = require('../models/Hotel');

// Create a new hotel
exports.createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all hotels
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a hotel by name
exports.getHotelByName = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ hotel_name: req.params.hotel_name });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
