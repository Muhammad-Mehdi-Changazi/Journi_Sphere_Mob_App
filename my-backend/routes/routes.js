const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/Reviews', reviewController.getReviews);
router.post('/Reviews', reviewController.createReview);

module.exports = router;
