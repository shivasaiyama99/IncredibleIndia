const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getGuideBookings, getMyBookings } = require('../controllers/bookingController');

router.post('/bookings', auth, createBooking);
router.get('/bookings/guide', auth, getGuideBookings);
router.get('/bookings/me', auth, getMyBookings);

module.exports = router;


