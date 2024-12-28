// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup logic
exports.signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Validate the role
    const validRoles = ['Customer', 'Hotel Management Staff']; // Add more roles if needed
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new user (password is stored as plain text)
    const newUser = new User({
      username,
      email,
      password,  // No hashing here
      role
    });

    // Save the user in the database
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};



/// Login logic without bcrypt
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare plaintext passwords directly
    if (password !== existingUser.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token including the role
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
      },
      'your_secret_key', // Use an environment variable for the secret key in production
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, role: existingUser.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};
