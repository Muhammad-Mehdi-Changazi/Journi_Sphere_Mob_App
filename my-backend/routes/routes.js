const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const cityController = require('../controllers/cityController')
const recommendationController = require('../controllers/recommendationController')

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/Reviews', reviewController.getReviews);
router.post('/Reviews', reviewController.createReview);
router.get('/api/cities', cityController.getCities);
router.get('/recommendations', recommendationController.getRecommendations)

module.exports = router;
