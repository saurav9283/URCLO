const express = require('express');
const { UserBuyerController, UserBookingDetailsController } = require('./user.buyer.controller');

const router = express.Router();

router.post('/buy-service' , UserBuyerController)
router.get('/user-booking-details' , UserBookingDetailsController)

module.exports = router;
