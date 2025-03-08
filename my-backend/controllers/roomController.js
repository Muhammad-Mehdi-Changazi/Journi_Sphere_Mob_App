const Room = require('../models/Room');
const { getSocket } = require('../socket')
// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get rooms by hotel_id
exports.getRoomsByHotel = async (req, res) => {
  try {
    const { hotel_id } = req.params;

    if (!hotel_id) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const rooms = await Room.find({ hotel_id });

    if (rooms.length === 0) {
      return res.status(404).json({ message: 'No rooms found for this hotel' });
    }

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Controller to get all rooms for a specific hotel
exports.getHotelRooms = async (req, res) => {
  try {
    const { hotel_id } = req.params;

    // Fetch rooms related to the hotel_id
    const rooms = await Room.find({ hotel_id }).exec();

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'No rooms found for this hotel' });
    }

    // Send rooms data as response
    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching rooms for hotel' });
  }
};

exports.updateRoom = async (req, res) => {
  const io = getSocket();
  try {
    const { id } = req.params;  // Extract room ID from request params
    const updatedRoomData = req.body;  // Extract updated room data from request body

    const updatedRoom = await Room.findByIdAndUpdate(id, updatedRoomData, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room updated successfully", updatedRoom });

    if (io) {
      io.emit('room_updated', updatedRoom);
    }

  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
