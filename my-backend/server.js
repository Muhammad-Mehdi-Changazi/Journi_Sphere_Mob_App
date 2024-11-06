const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;  // You can change the port number
const corsOptions = {
    origin: '*',  // Allow all origins for testing
    credentials: true,
};
app.use(cors(corsOptions));


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


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Check if the email exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  
    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  
    // Generate a JWT token
    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      'your_secret_key',  // Use an environment variable for the secret key in production
      { expiresIn: '1h' } // Set token expiration time as needed
    );
    console.log("logging in");
  
    // Send the token to the client
    res.status(200).json({
      message: 'Login successful',
      token,  // Send the token to the client
    });
  });


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
