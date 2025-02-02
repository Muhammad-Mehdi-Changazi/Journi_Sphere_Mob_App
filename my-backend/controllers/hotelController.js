const { mongo } = require('mongoose');
const Hotel = require('../models/Hotel');
const Reservation = require('../models/reservation')
mongoose = require('mongoose');
const Room = require('../models/Room');

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
    // console.log("Before",hotel_id);
    const hotelId = new mongoose.Types.ObjectId(hotel_id);
    // console.log("After" ,hotelId);
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
    // console.log("Request Body", req.body);
    const { reservationDetails } = req.body;

    // Check if reservation details are provided
    if (!reservationDetails) {
      return res.status(400).json({ error: 'Reservation details are required.' });
    }

    // Get room_id and place_id from the request body
    const roomId = new mongoose.Types.ObjectId(reservationDetails.roomID);
    const placeId = new mongoose.Types.ObjectId(reservationDetails.placeID);

    // Validate the ObjectId format for room_id and place_id
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid room_id format' });
    }
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ error: 'Invalid place_id format' });
    }

    reservationDetails.customer_name = reservationDetails.name;  // Map name to customer_name
    reservationDetails.phone_number = reservationDetails.phone; // Map phone to phone_number
    reservationDetails.room_ID = roomId; // Set room_ID
    reservationDetails.hotel_ID = placeId; // Set hotel_ID
    reservationDetails.CNIC = reservationDetails.CNIC; 

    // Ensure reservation date fields are set correctly
    reservationDetails.reservation_date = {
      from: new Date(reservationDetails.fromDate), // Assuming front-end uses 'fromDate' and 'toDate'
      to: new Date(reservationDetails.toDate),
    };

    // Create reservation
    const reservation = new Reservation(reservationDetails);
    await reservation.save();

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });

    // Emit event via Socket.IO
    if (io) {
      io.emit('reservation-updated', { hotelId: hotel._id, reservationDetails });
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

exports.getHotelsByCity = async (req, res) => {
  const { cityName } = req.params;  // Extract cityName from route parameters

  // console.log("Requested City:",cityName);  // Debugging log

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
