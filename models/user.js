const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//create user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: {
    type: String,
    required: true
  },
  email: String,
  characters: [{
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }],
}, { timestamps: true });

// Pre save hook
userSchema.pre('save', function(next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // Generate a salt and use it to hash the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // Replace the plain text password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// Create the model
const User = mongoose.model('User', userSchema);

// export the model
module.exports = router;
