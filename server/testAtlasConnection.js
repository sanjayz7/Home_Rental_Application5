require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

console.log('🔗 Testing corrected MongoDB Atlas connection...');
console.log('URI:', uri.replace(/:[^@]*@/, ':****@'));

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Atlas connection successful!');
    
    // Test ping
    const admin = client.db('admin');
    const result = await admin.command({ ping: 1 });
    console.log('✅ Ping successful:', result);
    
    // List databases
    const databases = await admin.admin().listDatabases();
    console.log('✅ Available databases:', databases.databases.map(db => db.name));
    
    // Test home_rental database
    const homeRentalDb = client.db('home_rental');
    const collections = await homeRentalDb.listCollections().toArray();
    console.log('✅ home_rental database collections:', collections.map(c => c.name));
    
    // Insert test document
    const testCollection = homeRentalDb.collection('connection_test');
    const testDoc = { message: 'Atlas connection successful!', timestamp: new Date() };
    await testCollection.insertOne(testDoc);
    console.log('✅ Test document inserted successfully!');
    
    // Clean up test document
    await testCollection.deleteOne({ message: 'Atlas connection successful!' });
    console.log('✅ Test document cleaned up!');
    
    console.log('\n🎉 MongoDB Atlas is working perfectly!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Authentication Issue:');
      console.log('The username or password might be incorrect.');
      console.log('Please verify in your MongoDB Atlas dashboard:');
      console.log('1. Database Access -> Database Users');
      console.log('2. Check the username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 DNS/Hostname Issue:');
      console.log('The cluster hostname might be incorrect.');
      console.log('Please verify the connection string from Atlas dashboard.');
    }
    
  } finally {
    await client.close();
    console.log('Connection closed.');
    process.exit(0);
  }
}

testConnection();