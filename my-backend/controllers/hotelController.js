const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Reservation = require('../models/reservation');

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
const isValidHotelId = (id) => /^[0-9a-fA-F]{24}$/.test(id);



// Get hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const { hotel_id } = req.params;
    console.log("Before",hotel_id);
    const hotelId = new mongoose.Types.ObjectId(hotel_id);
    console.log("After" ,hotelId);
    // Validate hotel_id
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ error: 'Invalid hotel_id format' });
    }
    // Fetch the hotel details (no population of 'rooms')
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    res.status(200).json({
      message: 'Hotel fetched successfully',
      hotel,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a reservation
exports.createReservation = async (req, res) => {
  try {
    const { reservationDetails } = req.body;

    if (!reservationDetails || !reservationDetails.hotel_id) {
      return res.status(400).json({ error: 'hotel_id is required in reservationDetails' });
    }

    const { hotel_id } = reservationDetails;

    // Validate hotel_id format
    if (!mongoose.Types.ObjectId.isValid(hotel_id)) {
      return res.status(400).json({ error: 'Invalid hotel_id format' });
    }

    // Verify the hotel exists
    const hotel = await Hotel.findById(hotel_id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Assign the hotel ID to the reservation
    reservationDetails.hotel = hotel._id;

    // Create reservation
    const reservation = new Reservation(reservationDetails);
    await reservation.save();

    res.status(201).json({
      message: 'Reservation created successfully',
      reservationDetails,
    });

    // Emit event via Socket.IO
    if (io) {
      io.emit('new-reservation', { hotelId: hotel._id, reservationDetails });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservation requests by hotel ID
exports.getReservationRequests = async (req, res) => {
  try {
    const { hotel_id } = req.query;

    // Validate hotel_id format
    if (!hotel_id || !mongoose.Types.ObjectId.isValid(hotel_id)) {
      return res.status(400).json({ error: 'Invalid or missing hotel_id' });
    }

    const reservations = await Reservation.find({ hotel: hotel_id });
    res.status(200).json({ requests: reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
