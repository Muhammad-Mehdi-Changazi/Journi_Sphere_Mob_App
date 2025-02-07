// // Get a specific city's tourist spots
// app.get("/api/tourist-spots/:city", async (req, res) => {
//   try {
//     const city = await Tourism.findOne({ name: req.params.city });
//     if (!city) return res.status(404).json({ message: "City not found" });
//     res.json(city);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

const axios = require("axios");
const TourismModel = require("../models/tourism");

// Fetch a specific city's tourist spots
// exports.fetchCitySpots = async (city) => {
//   try {
//     const response = await axios.get(`${API_URL}/${city}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching spots for ${city}:`, error);
//   }
// };

exports.fetchCitySpots = async (req, res) => {
  const { cityName } = req.query;
  console.log(cityName);

  // res.status(200).json({ cityName: city });
  try {
    const city = await TourismModel.findOne({ name: cityName });
    if (!city) return res.status(404).json({ message: "City not found Help" });
    res.json(city);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
