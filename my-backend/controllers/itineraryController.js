// controllers/itineraryController.js
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');

exports.saveItinerary = async (req, res) => {
  try {
    const { username, name, content } = req.body;
    if (!username || !name || !content) {
      return res.status(400).json({ error: "Missing required fields: username, name, and content" });
    }

    // Optionally, you could validate that the username exists in your User collection:
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newItinerary = new Itinerary({
      username, // associate with username
      name,
      content
    });

    await newItinerary.save();

    // Optionally update user itineraries array if desired:
    user.itineraries.push(newItinerary._id);
    await user.save();

    return res.status(201).json({
      message: 'Itinerary saved successfully!',
      itinerary: newItinerary
    });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    return res.status(500).json({ error: 'Failed to save itinerary' });
  }
};

exports.getUserItineraries = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Missing required field: username" });
    }
    const itineraries = await Itinerary.find({ username });
    return res.json(itineraries);
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
};
