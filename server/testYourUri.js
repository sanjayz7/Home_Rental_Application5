const { MongoClient } = require('mongodb');

// Your exact connection string from the message
const uri = "mongodb+srv://sanjayk23it_db_user:4jK5oLX2cwEepRsD@homerentalapplication.fqyafcb.mongodb.net/?retryWrites=true&w=majority&appName=HomeRentalApplication";

console.log('Testing your exact connection string...');
console.log('URI:', uri.replace(/:[^@]*@/, ':****@'));

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test admin command
    const admin = client.db('admin');
    const result = await admin.command({ ping: 1 });
    console.log('✅ Ping successful:', result);
    
    // List databases
    const databases = await admin.admin().listDatabases();
    console.log('✅ Available databases:', databases.databases.map(db => db.name));
    
    // Test specific database
    const homeRentalDb = client.db('home_rental');
    const collections = await homeRentalDb.listCollections().toArray();
    console.log('✅ home_rental database collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 DNS Resolution Issue:');
      console.log('The cluster hostname cannot be resolved.');
      console.log('Please check:');
      console.log('1. Your MongoDB Atlas cluster is active');
      console.log('2. The cluster name is correct');
      console.log('3. Your internet connection is working');
    } else if (error.message.includes('authentication')) {
      console.log('\n🔍 Authentication Issue:');
      console.log('Please check your username and password');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('\n🔍 SSL/TLS Issue:');
      console.log('There might be a network or firewall issue');
    }
  } finally {
    await client.close();
    console.log('\nConnection closed.');
    process.exit(0);
  }
}

testConnection();