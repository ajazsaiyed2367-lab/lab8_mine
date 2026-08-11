const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain text OK for this intro lab
  displayName: { type: String, required: true }
});

module.exports = mongoose.model('Admin', adminSchema);
