const express = require('express');
const { register, login, verifyOtp, resendOtp } = require('../userAuth/auth.controller');
const router = express.Router();

router.post('/register', register);
// router.post('/login', login);
// router.post('/verify-otp', verifyOtp);
// router.post('/resend-otp', resendOtp);

module.exports = router;
