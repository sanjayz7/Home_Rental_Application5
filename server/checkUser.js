require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'john.smith@example.com';
    const password = 'owner123';

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found. Creating new owner account...');
      
      // Create a new owner account
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name: 'John Smith',
        email: email,
        password_hash: hashedPassword,
        role: 'owner',
        created_at: new Date()
      });

      await newUser.save();
      console.log('Owner account created successfully');
      
    } else {
      console.log('User found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      
      // Test password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Updating password...');
        user.password_hash = await bcrypt.hash(password, 10);
        await user.save();
        console.log('Password updated successfully');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUser();