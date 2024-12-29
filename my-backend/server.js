const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Routes = require('./routes/routes');
const mongoose = require('mongoose');
require('dotenv').config(); // Import dotenv to load environment variables

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app); // Create an HTTP server instance

// List of allowed origins (can also be configured via .env)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:3001'];

// Dynamic CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers in requests
    credentials: true, // Allow cookies if needed
  })
);

// Body Parser Middleware
app.use(bodyParser.json());

// Socket.IO configuration with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins, // Allow multiple origins for Socket.IO
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

io.on('connection', (socket) => {
  console.log('Socket.IO connection established:', socket.id);

  // Example: Handle a custom event
  socket.on('custom_event', (data) => {
    console.log('Received custom_event:', data);
    // Emit a response to the client
    socket.emit('server_response', { message: 'Hello from the server!' });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Socket.IO connection closed:', socket.id);
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/', Routes);

// Start the Server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
