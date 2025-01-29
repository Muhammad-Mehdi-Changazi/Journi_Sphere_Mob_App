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
router.post('/hotel', hotelController.createHotel); // Make sure this function exists
router.get('/hotels', hotelController.getHotels);
router.get('/api/hotels/:placeName', hotelController.getHotelByName); // Route to get hotel by name
router.get('/api/hotels/admin/:username', hotelController.getHotelByUsername); // Route to get hotel by username
router.get('/hotels/city/:cityName', hotelController.getHotelsByCity); // Route to get hotels by city

// Reservation Routes
router.post('/api/reservations', hotelController.createReservation);
router.get('/api/reservations/requests', hotelController.getReservationRequests);

// Room Routes
router.post('/room', roomController.createRoom);
router.get('/rooms', roomController.getRooms);
router.get('/hotel/:hotel_name/rooms', roomController.getRoomsByHotel); // Fetch rooms by hotel

// Search Routes
router.get('/api/search', recommendationController.searchPlaces);

module.exports = router;
