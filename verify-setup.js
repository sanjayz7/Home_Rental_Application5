const axios = require('axios');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './server/.env' });

console.log('🔍 Verifying Home Rental Application Setup\n');

// Test MongoDB Atlas Connection
async function testDatabase() {
  const uri = process.env.MONGODB_URI;
  console.log('1. Testing MongoDB Atlas Connection...');
  
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    await client.close();
    
    console.log('   ✅ MongoDB Atlas: Connected');
    return true;
  } catch (error) {
    console.log('   ❌ MongoDB Atlas: Failed -', error.message);
    return false;
  }
}

// Test Backend Server
async function testBackend() {
  console.log('2. Testing Backend Server...');
  
  try {
    const response = await axios.get('http://localhost:5001', { timeout: 3000 });
    console.log('   ✅ Backend Server: Running on port 5001');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Backend Server: Not running on port 5001');
    } else {
      console.log('   ❌ Backend Server:', error.message);
    }
    return false;
  }
}

// Test Frontend
async function testFrontend() {
  console.log('3. Testing Frontend Server...');
  
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 3000 });
    console.log('   ✅ Frontend Server: Running on port 3000');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Frontend Server: Not running on port 3000');
    } else {
      console.log('   ❌ Frontend Server:', error.message);
    }
    return false;
  }
}

async function verifySetup() {
  const dbTest = await testDatabase();
  const backendTest = await testBackend();
  const frontendTest = await testFrontend();
  
  console.log('\n📊 Setup Status:');
  console.log(`   Database:  ${dbTest ? '✅ Ready' : '❌ Needs Setup'}`);
  console.log(`   Backend:   ${backendTest ? '✅ Ready' : '❌ Needs Setup'}`);
  console.log(`   Frontend:  ${frontendTest ? '✅ Ready' : '❌ Needs Setup'}`);
  
  if (dbTest && backendTest && frontendTest) {
    console.log('\n🎉 All systems are ready!');
    console.log('🌐 Open http://localhost:3000 in your browser');
  } else {
    console.log('\n🔧 Setup Instructions:');
    
    if (!dbTest) {
      console.log('   📁 Database: Check MongoDB Atlas credentials in server/.env');
    }
    
    if (!backendTest) {
      console.log('   🚀 Backend: Run "cd server && npm start" in terminal');
    }
    
    if (!frontendTest) {
      console.log('   🌐 Frontend: Run "cd client && npm start" in new terminal');
    }
  }
}

verifySetup().catch(console.error);