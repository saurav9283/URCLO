const express = require('express');
const { AddToCartController, RemoveFromCartController } = require('./user.cart.controller');

const router = express.Router();

router.post('/add-to-cart',AddToCartController);
router.put('/remove-from-cart',RemoveFromCartController);

module.exports = router;
