const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config/dbConfig');

let connected = false;

// Atlas and local MongoDB URIs
const ATLAS_URI = process.env.MONGODB_URI;
const LOCAL_URI = 'mongodb://localhost:27017/home_rental';

async function initialize(retries = 3) {
  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 2000
    };

    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection URI:', MONGODB_URI.replace(/:\/\/[^@]*@/, '://****@'));
    
    await mongoose.connect(MONGODB_URI, opts);
    connected = true;
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Database name:', mongoose.connection.db.databaseName);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      connected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      connected = true;
    });

    process.on('SIGINT', async () => {
      await close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return initialize(retries - 1);
    }
    
    console.error('All connection attempts failed.');
    console.error('Please check:');
    console.error('1. MongoDB Atlas cluster is running');
    console.error('2. Network whitelist includes your IP');
    console.error('3. Username and password are correct');
    console.error('4. Database name is correct');
    
    throw error;
  }
}

async function close() {
  if (connected) {
    try {
      await mongoose.connection.close();
      connected = false;
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

module.exports = { initialize, close };


