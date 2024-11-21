const express = require('express');
const { providerRegister, providerEmailVerify, providerPhoneVerify, providerOtpResend, providerLogin } = require('./providerAuth.controller');
const router = express.Router();

router.post('/register', providerRegister)
      .post('/email/verify', providerEmailVerify)
      .post('/phone/verify', providerPhoneVerify)
      .post('/resend/otp', providerOtpResend)
      .post('/login', providerLogin);

module.exports = router;