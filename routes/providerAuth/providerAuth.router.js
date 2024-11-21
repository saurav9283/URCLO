const express = require('express');
const { providerRegister, providerEmailVerify, providerPhoneVerify } = require('./providerAuth.controller');
const router = express.Router();

router.post('/register', providerRegister)
      .post('/email/verify', providerEmailVerify)
      .post('/phone/verify', providerPhoneVerify);

module.exports = router;