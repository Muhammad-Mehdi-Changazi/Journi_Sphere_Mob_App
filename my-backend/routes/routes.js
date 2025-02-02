const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const cityController = require('../controllers/cityController');
const recommendationController = require('../controllers/recommendationController');
const hotelController = require('../controllers/hotelController');
const roomController = require('../controllers/roomController');
const tourismController = require('../controllers/tourismController');

const router = express.Router();

// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Reviews Routes
router.get('/reviews', reviewController.getReviews);
router.post('/reviews', reviewController.createReview);

// City Routes
router.get('/api/cities', cityController.getCities);

// Tourism Routes
// router.get('/api/tourist-spots/:city', tourismController.getCityByName);

// Recommendation Routes
router.get('/recommendations', recommendationController.getRecommendations);

// Hotel Routes
router.post('/hotel', hotelController.createHotel); // Make sure this function exists
router.get('/hotels/city/:cityName', hotelController.getHotelsByCity); // Route to get hotels by city
router.get('/hotels/:hotel_id', hotelController.getHotelById);

// Reservation Routes
router.post('/api/reservations', hotelController.createReservation);
router.get('/GetAllReservationsByHotelID', hotelController.getReservationsByHotelId);
router.get('/GetReservations', hotelController.getReservationsByStatus);
router.put('/UpdateReservationsStatus/:id/updateStatus', hotelController.updateReservationStatus);

// Room Routes
router.post('/room', roomController.createRoom);
router.get('/getRooms/:hotel_id', roomController.getRoomsByHotel);
router.get('/:hotel_id/rooms', roomController.getHotelRooms);
router.put('/editroominfo/:id', roomController.updateRoom);

// Search Routes
router.get('/api/search', recommendationController.searchPlaces);

module.exports = router;
