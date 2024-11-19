const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { saveUser } = require('../userAuth/auth.service'); // Assuming you have a saveUser function in auth.service.js

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        const newUser = {
            name: profile.displayName,
            email: profile.email,
            provider: 'Google',
            googleId: profile.id
        };
        saveUser(newUser, (err, user) => {
            return done(err, user);
        });
    }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails'],
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        const newUser = {
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: 'Facebook',
            facebookId: profile.id
        };
        saveUser(newUser, (err, user) => {
            return done(err, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;