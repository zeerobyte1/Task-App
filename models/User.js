const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  displayName: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
