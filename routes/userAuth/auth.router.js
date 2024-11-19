const express = require('express');
const { register, verifyEmailOtp, resendEmailOtp, verifyPhoneOtp, resendPhoneOtp } = require('../userAuth/auth.controller');
const router = express.Router();
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
require('dotenv').config();


const path = require('path');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        console.log('Google profile', profile);
        console.log('Google Email', profile.email);
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));

router.get('/auth/google/:name/:email', (req, res) => {
    const { name, email } = req.params;
    console.log('req.params: ', req.params);
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    )
});

router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/success',
        failureRedirect: '/failure'
    }));

router.post('/register', register).post('/verify/email', verifyEmailOtp).post('/verify/phone', verifyPhoneOtp).post('/phone/resend', resendPhoneOtp).post('/email/resend', resendEmailOtp);


module.exports = router;
