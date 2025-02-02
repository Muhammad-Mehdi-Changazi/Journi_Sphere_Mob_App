const mongoose = require("mongoose");

const touristSpotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Image URL
});



const specificCitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  touristSpots: [touristSpotSchema], // Array of tourist spots
});

const Tourism = mongoose.model("Tourism", specificCitySchema);

module.exports = Tourism;
