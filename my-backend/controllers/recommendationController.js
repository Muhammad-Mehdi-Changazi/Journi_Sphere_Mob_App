const axios = require('axios');
const City = require('../models/city'); // Import your city model


// Function to get recommendations for hotels and restaurants
const getRecommendations = async (req, res) => {

  const { city } = req.query; // City passed as a query parameter
  try {
    const location = await City.findOne({ name: city });
    if (!location) {
      return res.status(404).send('City not found');
    }

    const googleApiKey = process.env.GOOGLE_API_KEY; // Use environment variable for Google API key
    const { lat, lng } = location;

    // Fetch hotels
    const hotelsResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${googleApiKey}`
    );

    // Fetch restaurants
    const restaurantsResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=restaurant&key=${googleApiKey}`
    );

    // Send the results back to the frontend
    res.json({
      hotels: hotelsResponse.data.results,
      restaurants: restaurantsResponse.data.results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recommendations');
  }
};



const searchPlaces = async (req, res) => {
  console.log("searching");
  const { query } = req.query;
  const googleApiKey = process.env.GOOGLE_API_KEY;  // Ensure this is set correctly

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query,
        key: googleApiKey, // API key should be passed correctly
      }
    });

    // If no results or if status is not 'OK', send an error message
    if (response.data.status !== 'OK' || !response.data.results.length) {
      return res.status(404).json({ error: 'No places found matching your query' });
    }

    // Send the data from Google API to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error making Google API request:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching data from Google API' });
  }
};


// Export both functions
module.exports = {
  getRecommendations,
  searchPlaces,
};