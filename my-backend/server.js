const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Routes = require('./routes/routes');
const mongoose = require('mongoose');
require('dotenv').config();  // Import dotenv to load environment variables

const http = require('http'); 
const socketIo = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app); // Create an HTTP server instance

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:8081',  // Allow frontend on localhost:8081
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

io.on('connection', (socket) => {
  console.log('Socket.IO connection established');
  // Handle Socket.IO connections here
});


app.use(cors({
  origin: 'http://localhost:8081', // allowing requests on localhost:8081
  methods: ['GET', 'POST'], // specifying which HTTP methods are allowed
  allowedHeaders: ['Content-Type', 'Authorization'] // specifying which headers are allowed in requests
}));

app.use(bodyParser.json());

// Connecting mongoose using the MongoDB URI from the .env file
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.use('/', Routes);

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
