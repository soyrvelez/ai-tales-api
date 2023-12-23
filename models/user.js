const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

// Create user schema
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

// Pre save hook for hashing the password
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

// Password validation method
userSchema.methods.validPassword = function(typedPassword) {
  return bcrypt.compareSync(typedPassword, this.password);
};

// toJSON method - omit the password field
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Create the model
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
