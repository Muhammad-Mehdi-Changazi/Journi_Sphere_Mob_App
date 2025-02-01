

// Get a specific city's tourist spots
app.get("/api/tourist-spots/:city", async (req, res) => {
  try {
    const city = await Tourism.findOne({ name: req.params.city });
    if (!city) return res.status(404).json({ message: "City not found" });
    res.json(city);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// // Get a single city by name
// exports.getCityByName = async (req, res) => {
//   try {
//     const city = await City.findOne({ name: req.params.cityName });
//     if (!city) return res.status(404).json({ message: 'City not found' });
//     res.json(city);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching city details' });
//   }
// };



// Fetch a specific city's tourist spots
export const fetchCitySpots = async (city) => {
  try {
    const response = await axios.get(`${API_URL}/${city}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching spots for ${city}:`, error);
  }
};