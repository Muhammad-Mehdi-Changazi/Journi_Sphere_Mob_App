const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const cityController = require('../controllers/cityController');
const recommendationController = require('../controllers/recommendationController');
const hotelController = require('../controllers/hotelController');
const roomController = require('../controllers/roomController');

const router = express.Router();

// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Reviews Routes
router.get('/reviews', reviewController.getReviews);
router.post('/reviews', reviewController.createReview);

// City Routes
router.get('/api/cities', cityController.getCities);

// Recommendation Routes
router.get('/recommendations', recommendationController.getRecommendations);

// Hotel Routes
router.post('/hotel', hotelController.createHotel);
router.get('/hotels', hotelController.getHotels);
router.get('/api/hotels/:hotel_id', hotelController.getHotelById); // Fetch hotel by ID

// Reservation Routes
router.post('/api/reservations', hotelController.createReservation);
router.get('/api/reservations/requests', hotelController.getReservationRequests); // Fetch reservations by hotel ID

// Room Routes
router.post('/room', roomController.createRoom);
router.get('/rooms', roomController.getRoomsByHotelId); // Fetch rooms by hotel ID

// Search Routes
router.get('/api/search', recommendationController.searchPlaces);

module.exports = router;
