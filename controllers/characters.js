const express = require('express');
const router = express.Router();
const { Character } = require('../models');
const getAvatar = require('../middleware/getAvatar');

// POST /new - Create a new character
router.post('/new', async (req, res) => {
  try {
    const newCharacter = await Character.create(req.body);
    const avatar = await getAvatar(req.body);
    newCharacter.avatar = avatar
    await newCharacter.save();
    res.status(200).json(newCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).send('Server error');
  }
});

// GET /:id - View a single character
router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).send('Character not found');
    }
    res.status(200).json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).send('Server error');
  }
});

// GET /collection/:userId - View all characters for a user
router.get('/collection/:userId', async (req, res) => {
  try {
    const characters = await Character.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).send('Server error');
  }
});


// PUT /edit/:id - Edit a single character
router.put('/edit/:id', async (req, res) => {
  try {
    const updatedCharacter = await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCharacter) {
      return res.status(404).send('Character not found');
    }
    res.status(200).json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).send('Server error');
  }
});

// DELETE /delete/:id - Delete a character
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedCharacter = await Character.findByIdAndDelete(req.params.id);
    if (!deletedCharacter) {
      return res.status(404).send('Character not found');
    }
    res.status(200).json({ message: 'Character deleted' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
