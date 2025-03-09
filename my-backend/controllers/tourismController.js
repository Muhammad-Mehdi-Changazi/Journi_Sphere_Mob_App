const axios = require("axios");
const TourismModel = require("../models/tourism");

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

exports.getTouristSpot = async (req, res) => {
  try {
    const { city, spotName } = req.query;
    // Find city and match specific tourist spot
    const cityData = await TourismModel.findOne({ name: city });

    if (!cityData) {
      return res.status(404).json({ message: "City not found" });
    }

    const touristSpot = cityData.touristSpots.find(
      (spot) => spot.name.toLowerCase() === spotName.toLowerCase()
    );

    if (!touristSpot) {
      return res.status(404).json({ message: "Tourist spot not found" });
    }

    res.json(touristSpot);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

