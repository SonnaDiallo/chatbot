const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  birthdate: { type: Date },
  email: { type: String, required: true, unique: true },
  registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
