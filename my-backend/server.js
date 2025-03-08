const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Routes = require('./routes/routes');
const mongoose = require('mongoose');
require('dotenv').config();
const http = require('http');
const { initSocket } = require('./socket'); // Import the socket init function

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Allow CORS from all origins
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body Parser Middleware
app.use(bodyParser.json());

// Initialize socket.io
initSocket(server);

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

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
