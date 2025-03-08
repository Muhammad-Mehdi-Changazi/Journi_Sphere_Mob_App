const mongoose = require("mongoose");

// const touristSpotSchema = new mongoose.Schema({
//   // Image URL
// });

const specificCitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  touristSpots: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      image: { type: String, required: true },
    },
  ], // Array of tourist spots
});

const Tourism = mongoose.model("Tourism", specificCitySchema);

module.exports = Tourism;
