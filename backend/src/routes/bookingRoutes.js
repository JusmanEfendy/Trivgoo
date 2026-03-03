const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Public routes
router.post('/', bookingController.create);
router.get('/:ref', bookingController.findByRef);

module.exports = router;
