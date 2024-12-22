const express = require('express');
const { bookTicket, processBookings, getAdjacentSeats} = require('../controllers/bookingController');
const router = express.Router();

router.post('/book', bookTicket);
router.post('/adjacentSeats', getAdjacentSeats)
router.get('/processBooking', processBookings)

module.exports = router;
