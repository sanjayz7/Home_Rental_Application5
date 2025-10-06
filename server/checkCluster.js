require('dotenv').config();
const { MongoClient } = require('mongodb');

// Extract hostname from MongoDB URI
const uri = process.env.MONGODB_URI;
console.log('Original URI:', uri.replace(/:[^@]*@/, ':****@'));

// Extract hostname
const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/);
if (match) {
  const hostname = match[1];
  console.log('Extracted hostname:', hostname);
  
  // Try to resolve hostname
  const dns = require('dns');
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error('DNS lookup failed:', err.message);
      console.log('\nTrying alternative connection methods...');
      
      // Try connecting directly
      testDirectConnection();
    } else {
      console.log('DNS lookup successful:', address);
      testDirectConnection();
    }
  });
}

async function testDirectConnection() {
  console.log('\nTesting direct MongoDB connection...');
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log('✅ Direct connection successful!');
    
    const admin = client.db('admin');
    const result = await admin.command({ ping: 1 });
    console.log('✅ Ping successful:', result);
    
    const db = client.db('home_rental');
    const collections = await db.listCollections().toArray();
    console.log('✅ Database accessible. Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
    
    // Try with different hostname formats
    console.log('\nTrying alternative cluster names...');
    const alternativeUris = [
      uri.replace('homerentalapplication.fqyafcb', 'cluster0.fqyafcb'),
      uri.replace('homerentalapplication.fqyafcb', 'homerentalapplication.mongodb'),
      uri.replace('.fqyafcb.mongodb.net', '.mongodb.net'),
    ];
    
    for (let altUri of alternativeUris) {
      if (altUri !== uri) {
        console.log('Trying:', altUri.replace(/:[^@]*@/, ':****@'));
        try {
          const altClient = new MongoClient(altUri, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000,
          });
          await altClient.connect();
          console.log('✅ Alternative connection successful!');
          console.log('Use this URI:', altUri.replace(/:[^@]*@/, ':****@'));
          await altClient.close();
          break;
        } catch (altError) {
          console.log('❌ Alternative failed:', altError.message);
        }
      }
    }
  } finally {
    await client.close();
    process.exit(0);
  }
}