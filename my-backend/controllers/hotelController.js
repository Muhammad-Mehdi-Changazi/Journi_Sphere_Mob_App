const { mongo } = require('mongoose');
const Hotel = require('../models/Hotel');
const Reservation = require('../models/reservation')
mongoose = require('mongoose');
const Room = require('../models/Room');
const { getSocket } = require('../socket')

// Create a new hotel
exports.createHotel = async (req, res) => {
  const io = getSocket();
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
  const io = getSocket();
  try {
    console.log("Request Body", req.body);

    // Ensure reservationDetails is extracted correctly
    const reservationDetails = req.body.reservationDetails || req.body;

    if (!reservationDetails) {
      return res.status(400).json({ error: "Reservation details are required." });
    }

    // Validate ObjectId format before converting
    if (!mongoose.Types.ObjectId.isValid(reservationDetails.roomID)) {
      return res.status(400).json({ error: "Invalid roomID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(reservationDetails.placeID)) {
      return res.status(400).json({ error: "Invalid placeID format" });
    }

    // Convert to ObjectId
    const roomId = new mongoose.Types.ObjectId(reservationDetails.roomID);
    const placeId = new mongoose.Types.ObjectId(reservationDetails.placeID);

    // Construct reservation object
    const newReservation = {
      customer_name: reservationDetails.name,
      phone_number: reservationDetails.phone,
      email: reservationDetails.email,
      CNIC: reservationDetails.CNIC,
      paymentMethod: reservationDetails.paymentMethod,
      reservationStatus: reservationDetails.reservationStatus,
      room_ID: roomId,
      hotel_ID: placeId,
      reservation_date: {
        from: new Date(reservationDetails.fromDate),
        to: new Date(reservationDetails.toDate),
      },
    };

    // Save reservation
    const reservation = new Reservation(newReservation);
    const savedReservation = await reservation.save();

    let room = null;

    // If reservation is confirmed, update room availability
    if (reservationDetails.reservationStatus === "CONFIRMED") {
      room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Update room availability status
      room.available = false;
      await room.save();

      console.log(`Room ${room.room_number} availability updated to false`);

      // Emit real-time update to both admin and reservation screens
      if (io) {
        const roomData = {
          roomID: room._id,
          roomType: room.room_type,
          roomNumber: room.room_number,
          hotelID: room.hotel_id,
          rent: room.rent,
          available: room.available,
          bedSize: room.bed_size,
        };

        io.emit("room_reserved", {room: roomData });
      } else {
        console.error("Socket.IO instance is undefined!");
      }
    }

    res.status(201).json({
      message: "Reservation created successfully",
      reservation: savedReservation,
      room: room, // Include room info in response
    });

    // Emit event for new reservations
    if (io) {
      io.emit("reservation-created", { placeID: placeId, reservationDetails: savedReservation });
    } else {
      console.error("Socket.IO instance is undefined!");
    }
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: error.message });
  }
};



exports.getReservationsByHotelId = async (req, res) => {
  try {
    const { hotel_id } = req.query;

    if (!hotel_id) {
      return res.status(400).json({ error: "Hotel ID is required" });
    }

    // Fetch reservations for the given hotel_id
    const reservations = await Reservation.find({ hotel_ID: hotel_id });
    // console.log("Reservations",reservations);

    // Return the reservations
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getHotelsByCity = async (req, res) => {
  const { cityName } = req.params; 

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

exports.getReservationsByStatus = async (req, res) => {
  try {
    const { status, hotel_id } = req.query;

    if (!status || !hotel_id) {
      return res.status(400).json({ error: "Status and hotel_id are required" });
    }

    // If multiple statuses are sent as an array, use $in operator
    const statusArray = status.includes(",") ? status.split(",") : [status];

    // Fetch reservations filtered by both status and hotel_id
    const reservations = await Reservation.find({
      reservationStatus: { $in: statusArray },
      hotel_ID: hotel_id,  // Filtering by hotel_id
    });
    
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find the reservation by ID
    const updatedReservation = await Reservation.findById(req.params.id);

    if (!updatedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (status === "CONFIRMED" && updatedReservation.reservationStatus !== "CONFIRMED") {
      const room_id = updatedReservation.room_ID;

      const updatedRoom = await Room.findByIdAndUpdate(
        room_id,
        { available: false },
        { new: true }
      );

      if (!updatedRoom) {
        return res.status(404).json({ error: "Room not found" });
      }
    }

    updatedReservation.reservationStatus = status;

    await updatedReservation.save();

    res.status(200).json(updatedReservation);
    
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ error: "Server error" });
  }
};
