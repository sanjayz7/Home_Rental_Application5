const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');
require('dotenv').config();

async function createOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if owner already exists
    const existingOwner = await User.findOne({ email: 'john.smith@example.com' });
    if (existingOwner) {
      console.log('Owner account already exists');
      return;
    }

    // Create new owner account
    const hashedPassword = await bcrypt.hash('owner123', 10);
    const owner = new User({
      name: 'John Smith',
      email: 'john.smith@example.com',
      password_hash: hashedPassword,
      role: 'owner',
      created_at: new Date()
    });

    await owner.save();
    console.log('Owner account created successfully');
    console.log('Email: john.smith@example.com');
    console.log('Password: owner123');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createOwner();