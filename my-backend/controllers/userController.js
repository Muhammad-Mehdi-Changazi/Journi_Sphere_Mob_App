const UserModel = require("../models/User");
const { getSocket } = require('../socket')

// get user by email
exports.getUser = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not found controller" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update profile after accessing it by email
exports.updateProfile = async (req, res) => {
  const io = getSocket();
  try {
    const { email } = req.query;  // Extract user email from request query parameters
    const updatedProfileData = req.body;  // Extract updated user data from request body
    console.log(updatedProfileData);
    
    // Find and update the user by email
    const updatedProfile = await UserModel.findOneAndUpdate({ email: email }, updatedProfileData, { new: true });
    console.log(updatedProfile);
    
    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", updatedProfile });

    if (io) {
      io.emit('profile_updated', updatedProfile);
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




