const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const cityController = require('../controllers/cityController')
const recommendationController = require('../controllers/recommendationController')
const { createHotel, getHotels, getHotelByName } = require('../controllers/hotelController');
const { createRoom, getRooms, getRoomsByHotel } = require('../controllers/roomController');


const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/Reviews', reviewController.getReviews);
router.post('/Reviews', reviewController.createReview);
router.get('/api/cities', cityController.getCities);
router.get('/recommendations', recommendationController.getRecommendations)
router.post('/Hotel', createHotel);
router.get('/Hotels', getHotels);
router.get('/:hotel_name', getHotelByName);
router.post('/Room', createRoom);
router.get('/Rooms', getRooms);
router.get('/hotel/:hotel_name', getRoomsByHotel);
router.get('/api/search',recommendationController.searchPlaces)


module.exports = router;
