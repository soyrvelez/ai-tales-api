const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  user: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
  }],
  name: String,
  species: String,
  gender: String,
  age: Number,
  personality: String,
  favoriteHobby:String
}, { timestamps: true });

// Create the model
const Character = mongoose.model('Character', characterSchema);

module.exports = router;
