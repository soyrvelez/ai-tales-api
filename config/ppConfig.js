const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Database
const { User } = require('../models');

const STRATEGY = new LocalStrategy({
    usernameField: 'email',         // looks for an email field as the username
    passwordField: 'password'       // looks for an password field as the password
    }, async (email, password, cb) => {
        try {
            const foundUser = await User.findOne({ email: email });

            if (!foundUser || !foundUser.validPassword(password)) {
                cb(null, false);     // if no user or invalid password, return false
            } else {
                cb(null, foundUser);
            }
        } catch (err) {
            console.log('------- Error below -----------');
            console.log(err);
        }
});

// Passport "serialize" info to be able to login
passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const foundUser = await User.findById(id);

        if (foundUser) {
            cb(null, foundUser);
        }
    } catch (err) {
        console.log('---- Yo... There is an error ----');
        console.log(err);
    }
});

passport.use(STRATEGY);

module.exports = passport;
