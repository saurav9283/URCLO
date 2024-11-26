const express = require('express');
const { AddToCartController, RemoveFromCartController, GetCartController } = require('./user.cart.controller');

const router = express.Router();

router.post('/add-to-cart',AddToCartController);
router.put('/remove-from-cart',RemoveFromCartController);
router.get('/get-cart',GetCartController);

module.exports = router;
