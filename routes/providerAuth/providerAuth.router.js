const express = require('express');
const { providerRegister, providerEmailVerify, providerPhoneVerify, providerOtpResend, providerLogin, providerForgorPassword, providerResetPassword } = require('./providerAuth.controller');
const router = express.Router();

router.post('/register', providerRegister)
      .post('/email/verify', providerEmailVerify)
      .post('/phone/verify', providerPhoneVerify)
      .post('/resend/otp', providerOtpResend)
      .post('/login', providerLogin)
      .post('/forgot-password', providerForgorPassword)
      .post('/reset-password', providerResetPassword);

module.exports = router;