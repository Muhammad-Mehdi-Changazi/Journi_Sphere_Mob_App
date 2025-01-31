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
