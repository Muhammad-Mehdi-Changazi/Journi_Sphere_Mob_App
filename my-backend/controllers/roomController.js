const Room = require('../models/Room');

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

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get rooms by hotel name
exports.getRoomsByHotelId = async (req, res) => {
  try {
    const { hotel_id } = req.query; // Fetch hotel_id from query parameter

    if (!hotel_id) {
      return res.status(400).json({ error: 'hotel_id is required' });
    }

    const rooms = await Room.find({ hotel: hotel_id });

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'No rooms found for this hotel' });
    }

    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
