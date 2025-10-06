require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', MONGODB_URI.replace(/:[^@]*@/, ':****@')); // Hide password in logs

async function testConnection() {
  try {
    const opts = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 50,
      retryWrites: true,
      wtimeoutMS: 30000
    };

    await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test document inserted successfully!');
    
    const testDoc = await testCollection.findOne({ test: 'connection' });
    console.log('✅ Test document retrieved:', testDoc);
    
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Test document cleaned up!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  }
}

testConnection();