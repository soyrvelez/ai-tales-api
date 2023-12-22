const express = require('express');
const router = express.Router();
//import the User Model
const { User } = require('../models');


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


module.exports = router;