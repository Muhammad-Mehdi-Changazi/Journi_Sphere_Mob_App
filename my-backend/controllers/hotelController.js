const Hotel = require('../models/Hotel');
const Reservation = require('../models/reservation')

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
    console.log("Data received.");
    const { reservationDetails } = req.body;
    const { placeName } = req.params;

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