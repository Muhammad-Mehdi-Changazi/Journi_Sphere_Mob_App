const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const cityController = require('../controllers/cityController');
const recommendationController = require('../controllers/recommendationController');
const { createHotel, getHotels, getHotelByName, getHotelByUsername, createReservation, getReservationRequests } = require('../controllers/hotelController');
const { createRoom, getRooms, getRoomsByHotel } = require('../controllers/roomController');

const router = express.Router();

// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Reviews Routes
router.get('/Reviews', reviewController.getReviews);
router.post('/Reviews', reviewController.createReview);

// City Routes
router.get('/api/cities', cityController.getCities);

// Recommendation Routes
router.get('/recommendations', recommendationController.getRecommendations);

// Hotel Routes
router.post('/Hotel', createHotel);
router.get('/Hotels', getHotels);
router.get('/api/hotels/:placeName', getHotelByName); // Route to get hotel by name
router.get('/api/hotels/admin/:username', getHotelByUsername); // Route to get hotel by username

// Reservation Routes
router.post('/api/reservations', createReservation);

// New route to get reservation requests by hotel name
router.get('/api/reservations/requests', getReservationRequests);

// Room Routes
router.post('/Room', createRoom);
router.get('/Rooms', getRooms);
router.get('/hotel/:hotel_name', getRoomsByHotel);

// Search Routes
router.get('/api/search', recommendationController.searchPlaces);

module.exports = router;
