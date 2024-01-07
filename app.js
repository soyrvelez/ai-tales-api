const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const db = require('./models');

// environment variables
SECRET_SESSION = process.env.SECRET_SESSION;

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());

app.use(session({
    secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
    resave: false,             // Save the session even if it's modified, make this false
    saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

// add passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(res.locals);
    res.locals.alerts = req.flash();
    res.locals.currentUser = req.user;
    next();
});


app.get('/', (req, res) => {
    res.redirect('/');
});

/*
IMPORT CONTROLLERS HERE
*/

app.use('/users', require('./controllers/users'));
app.use('/characters', require('./controllers/characters'));
app.use('/scenes', require('./controllers/scenes'))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server connected to PORT: ${PORT}`);
});

module.exports = app;
