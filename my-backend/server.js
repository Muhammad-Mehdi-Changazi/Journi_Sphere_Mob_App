const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = 6000;  // You can change the port number
app.use(cors());

// Body parser middleware to handle POST request data
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://sQpbJkHNcJzho6Pd:sQpbJkHNcJzho6Pd@manzil.gxdiu.mongodb.net/', 
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));


// User Schema and Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// Signup Route
app.post('/signup', async (req, res) => {
  console.log('Request data:', req.body);
  const { username, email, password } = req.body;
  console.log("yup");
  
  // Check if the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
