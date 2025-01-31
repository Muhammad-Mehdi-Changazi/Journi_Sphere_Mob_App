const { mongo } = require('mongoose');
const Hotel = require('../models/Hotel');
const Reservation = require('../models/reservation')
mongoose = require('mongoose');

let io;

// Initialize the Socket.IO instance
exports.setSocket = (socketIoInstance) => {
  io = socketIoInstance;
};

// Create a new hotel
exports.createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json({
      message: 'Hotel created successfully',
      hotel,
    });

    // Emit the new hotel event to connected clients
    if (io) {
      io.emit('hotel-created', hotel);
    }
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

// Get hotel by place name
exports.getHotelByName = async (req, res) => {
  try {
    let { placeName } = req.params;
    placeName = placeName.trim().replace(/\r?\n|\r/g, '');

    const hotel = await Hotel.findOne({ hotel_name: placeName }).populate('rooms'); // Populate rooms

    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    res.status(200).json({
      message: 'Hotel fetched successfully',
      hotel,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get hotel by username
exports.getHotelByUsername = async (req, res) => {
  try {
    const { username } = req.params;
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

// Handle new reservation request (using Socket.IO)
exports.createReservation = async (req, res) => {
  try {
    console.log(req.body);
    console.log("Data received.");
    const { reservationDetails } = req.body;
    console.log(reservationDetails);

    // Check if reservation details and placeName are provided
    if (!reservationDetails) {
                return res.status(400).json({ error: 'Reservation details are required.' });
            }

    // Find the hotel by name (placeName)
    const hotel = await Hotel.findOne({ hotel_name: placeName });
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Add the hotel ID to the reservation details
    reservationDetails.hotel = hotel._id;

    // Create a new reservation with the hotel reference
    const reservation = new Reservation(reservationDetails);
    await reservation.save();

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });

    // Emit the new reservation event to connected clients
    if (io) {
      io.emit('reservation-updated', { hotelId: hotel._id, reservationDetails });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getReservationRequests = async (req, res) => {
  try {
    const { hotelName } = req.query; // Extract hotelName from query parameters

    if (!hotelName) {
      return res.status(400).json({ error: 'hotelName is required' });
    }

    const hotel = await Hotel.findOne({ hotel_name: hotelName });
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const reservations = await Reservation.find({ hotel: hotel._id });
    res.status(200).json({ requests: reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHotelsByCity = async (req, res) => {
  const { cityName } = req.params;  // Extract cityName from route parameters

  // console.log("Requested City:", cityName);  // Debugging log

  if (!cityName) {
    return res.status(400).json({ message: 'City is required' });
  }

  try {
    // console.log('Fetching hotels for city:', cityName);
    const hotels = await Hotel.find({ city: cityName }); // Fetch hotels from DB

    if (hotels.length === 0) {
      return res.status(404).json({ message: 'No hotels found for this city' });
    }

    return res.json({ hotels });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return res.status(500).json({ message: 'Failed to fetch hotels' });
  }
};


// Get hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    console.log(req.params);
    const { hotel_id } = req.params;
    console.log(hotel_id);

    // Validate hotel_id
    if (!mongoose.Types.ObjectId.isValid(hotel_id)) {
      return res.status(400).json({ error: 'Invalid hotel_id format' });
    }

    // Convert string to ObjectId using new keyword
    const hotelId = new mongoose.Types.ObjectId(hotel_id);

    // Fetch the hotel details (no population of 'rooms')
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found 123' });

    res.status(200).json({
      message: 'Hotel fetched successfully',
      hotel,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
