const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const cityController = require('../controllers/cityController');
const recommendationController = require('../controllers/recommendationController');
const hotelController = require('../controllers/hotelController');
const roomController = require('../controllers/roomController');
const tourismController = require('../controllers/tourismController');
const userController = require('../controllers/userController');
const itineraryController = require('../controllers/itineraryController')
const carRentalCompanyController = require('../controllers/carRentalController');


const router = express.Router();

// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Reviews Routes
router.get('/reviews', reviewController.getReviews);
router.post('/reviews', reviewController.createReview);
router.get('/api/reviews/', reviewController.getReviewsByEmail); // for Profile

// City Routes
router.get('/api/cities', cityController.getCities);

// Recommendation Routes
router.get('/recommendations', recommendationController.getRecommendations);

// Hotel Routes
router.post('/hotel', hotelController.createHotel); // Make sure this function exists
router.get('/hotels/city/:cityName', hotelController.getHotelsByCity); // Route to get hotels by city
router.get('/hotels/:hotel_id', hotelController.getHotelById);
router.put('/edithotel/:hotel_id', hotelController.editHotel);

// Reservation Routes
router.post('/api/reservations', hotelController.createReservation);
router.get('/GetAllReservationsByHotelID', hotelController.getReservationsByHotelId);
router.get('/GetReservations', hotelController.getReservationsByStatus);
router.put('/UpdateReservationsStatus/:id/updateStatus', hotelController.updateReservationStatus);
router.get('/api/reservations-by-email/', hotelController.getReservationsByEmail); // for Profile

// Room Routes
router.post('/room', roomController.createRoom);
router.get('/getRooms/:hotel_id', roomController.getRoomsByHotel);
router.get('/:hotel_id/rooms', roomController.getHotelRooms);
router.put('/editroominfo/:id', roomController.updateRoom);

// Search Routes
router.get('/api/search', recommendationController.searchPlaces);

// User routes
router.get('/api/user/', userController.getUser);
router.put('/user/', userController.updateProfile);

//itinerary routes
router.post('/itinerary/save', itineraryController.saveItinerary);
router.get('/itinerary/my', itineraryController.getUserItineraries);


// Car Rental Routes
router.get('/car-rental-companies/test', carRentalCompanyController.testCarRentalEndpoint);
router.get('/car-rental-companies/city/:city', carRentalCompanyController.getCarRentalCompaniesByCity);
router.get('/car-rental-companies/:id', carRentalCompanyController.getCarRentalCompanyById);
router.get('/api/user-car-rentals/',carRentalCompanyController.getCarRentalCompanyByEmail)

router.post('/book', carRentalCompanyController.bookCar);
router.post('/car-rental-companies', carRentalCompanyController.createCarRentalCompany);
router.get('/companies/:id', carRentalCompanyController.getCompanyDetails);
router.post('/api/cars', carRentalCompanyController.addCar);
router.put('/api/cars/:registration_number', carRentalCompanyController.updateCar);
router.put('/update-company/:id', carRentalCompanyController.updateCompanyDetails);

module.exports = router;
