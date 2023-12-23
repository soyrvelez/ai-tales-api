const express = require('express');
const router = express.Router();
//import the User Model
const { User } = require('../models');
const passport = require('../config/ppConfig');


// POST /new - Create new user
router.post('/new', async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });
        console.log(`${newUser} was created successfully`);
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
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true })
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



// import models
const { user } = require('../models');

router.get("/signup", (req, res) => {
  return res.render("auth/signup");
});

router.get("/login", (req, res) => {
  return res.render("auth/login");
});

router.get('/logout', (req, res) => {
  req.logOut(function(err, next) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Logging out... See you next time!');
    res.redirect('/');
  }); // logs the user out of the session
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  successFlash: 'Welcome back ...',
  failureFlash: 'Either email or password is incorrect'
}));

router.post('/signup', async (req, res) => {
  // we now have access to the user info (req.body);
  const { email, name, password } = req.body; // goes and us access to whatever key/value inside of the object
  try {
    const [_user, created] = await user.findOrCreate({
        where: { email },
        defaults: { name, password }
    });

    if (created) {
        // if created, success and we will redirect back to / page
        console.log(`----- ${_user.name} was created -----`);
        const successObject = {
            successRedirect: '/',
            successFlash: `Welcome ${_user.name}. Account was created and logging in...`
        }
        //
        passport.authenticate('local', successObject)(req, res);
    } else {
      // Send back email already exists
      req.flash('error', 'Email already exists');
      res.redirect('/auth/signup'); // redirect the user back to sign up page to try again
    }
  } catch (error) {
        // There was an error that came back; therefore, we just have the user try again
        console.log('**************Error');
        console.log(error);
        req.flash('error', 'Either email or password is incorrect. Please try again.');
        res.redirect('/auth/signup');
  }
});

module.exports = router;
