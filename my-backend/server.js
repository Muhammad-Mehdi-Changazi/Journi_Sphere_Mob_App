const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Routes = require('./routes/routes');
const mongoose = require('mongoose');
require('dotenv').config();  // Import dotenv to load environment variables
const http = require('http'); 
const socketIo = require('socket.io');
const app = express();
const port = process.env.PORT;

const server = http.createServer(app); // Create an HTTP server instance

const io = socketIo(server); // Pass the server instance to Socket.IO

io.on('connection', (socket) => {
  console.log('Socket.IO connection established');
  // Handle Socket.IO connections here
});


app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());

// Connecting mongoose using the MongoDB URI from the .env file
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

app.use('/', Routes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
