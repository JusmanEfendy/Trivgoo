const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const roomController = require('../controllers/roomController');
const bookingController = require('../controllers/bookingController');

// Hotel management
router.get('/hotels', hotelController.list);
router.post('/hotels', hotelController.create);
router.put('/hotels/:id', hotelController.update);
router.delete('/hotels/:id', hotelController.delete);

// Room management
router.get('/hotels/:hotelId/rooms', roomController.listByHotel);
router.post('/rooms', roomController.create);
router.put('/rooms/:id', roomController.update);
router.delete('/rooms/:id', roomController.delete);

// Booking management
router.get('/bookings', bookingController.list);
router.put('/bookings/:ref/cancel', bookingController.cancel);

module.exports = router;
