const express = require('express');
const router = express.Router();
//import the User Model
const { User } = require('../models');

//------------------------------
//POST /user/new - create user and return user
//-------------------------------
// router.post('/new', (req, res) => {
//     User.create({
//         username: req.body.username,
//         password: req.body.password,
//         email: req.body.email
//     })
//         .then(user => {
//             console.log(user);
//             return res.json(user)
//         })
//         .catch(error => {
//             console.log('---read ObjectId error ---', error);
//             res.status(404).json({ error: 'Internal Server Error' })
//         });
//     });

    // POST /new - Create new user
router.post('/new', async (req, res) => {
    try {
      const newUser = await User.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
      res.status(200).json(newUser);
      console.log(`${username} was created successfully`);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Server error');
    }
  });

  //------------------------------
//GET /:id - return one user
//-------------------------------
// router.get('/:id', async (req, res) => {
//     try {
//     const user = await User.findById(req.params.id)
//             console.log('---found user ---\n', user);
//             return res.json(user);
//         }
//         .catch(error => {
//             console.log('---read ObjectId error ---', error);
//             res.status(500).json({ error: 'Internal Server Error' })
//         });
//     }
// });

    module.exports = router;