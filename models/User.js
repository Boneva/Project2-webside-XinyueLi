const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mbti: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthday: { type: Date, required: true }  // <- new field added
});

module.exports = mongoose.model('User', userSchema);