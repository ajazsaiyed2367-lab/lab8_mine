// One-time script to insert the hard-coded admin account into MongoDB.
// Run with:  node seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab7';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin account already exists, nothing to do.');
  } else {
    await Admin.create({
      username: 'admin',
      password: 'admin123',
      displayName: 'Admin'
    });
    console.log('Admin account created: username=admin, password=admin123');
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error seeding admin:', err);
  process.exit(1);
});
