const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Public routes
router.get('/search', hotelController.search);
router.get('/:id', hotelController.detail);

module.exports = router;
