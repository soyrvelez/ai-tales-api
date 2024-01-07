const express = require('express');
const router = express.Router();
//import the User Model
const { User } = require('../models');
const passport = require('../config/ppConfig');
const jwt = require('jsonwebtoken');

JWT_SECRET = process.env.JWT_SECRET;

// POST /new - Create new user
router.post('/new', async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });
        console.log(`${newUser} was created successfully`);
        res.set('Access-Control-Allow-Origin', 'https://ai-tales.vercel.app');
        res.status(200).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Server error');
    }
});

//------------------------------
//GET /:id - return one user
//-------------------------------
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404);
            console.log('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        console.log('Error finding user', error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

//------------------------------
//PUT /edit/:id - edit user account and return user account
//-------------------------------
router.put('/edit/:id', async (req, res) => {
    try {
        // Check if the email is already in use by another user
        if (req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Proceed to update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(`${req.params.id} was updated successfully`);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//------------------------------
// DELETE /delete/:id - delete user account
//-------------------------------
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ message: ` User was deleted successfully` })
    } catch (error) {
        console.error('Failed to delete user', error);
        return res.status(500).json({ error: "Server error" });
    }
});

/* **********************************************
**********************************************
**********************************************
**********************************************
**********************************************
                AUTH
**********************************************
**********************************************
**********************************************
**********************************************
********************************************** */
router.get("/signup", (req, res) => {
    return res.message({ message: "Signup Page" });
});

router.get("/login", (req, res) => {
    return res.message({ message: "Auth/Login" });
});

router.get('/logout', (req, res) => {
    req.logOut(function (err, next) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logging out... See you next time!');
        res.redirect('/');
    }); // logs the user out of the session
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            // Successful authentication
            console.log(user);
            const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Authentication successful', token });
        });
    })(req, res, next);
});

router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if a user with the given email already exists
        let user = await User.findOne({ email });

        if (!user) {
            // If no user exists, create a new user
            user = await User.create({ email, username, password });
            console.log(`----- ${user.username} was created -----`);

            const successObject = {
                successRedirect: '/',
                successFlash: `Welcome ${user.username}. Account was created and logging in...`
            };

            // Authenticate and redirect
            passport.authenticate('local', successObject)(req, res);
        } else {
            // If user exists, send back a message
            req.flash('error', 'Email already exists');
            res.redirect('/auth/signup'); // Redirect back to sign up page
        }
    } catch (error) {
        console.log('**************Error**************', error);
        req.flash('error', 'Either email or password is incorrect. Please try again.');
        res.redirect('/auth/signup');
    }
});

module.exports = router;
