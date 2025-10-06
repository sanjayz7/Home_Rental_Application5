const { MongoClient } = require('mongodb');

// Common MongoDB Atlas cluster naming patterns
const commonClusterNames = [
  'cluster0',
  'cluster1', 
  'homerentalapplication',
  'HomeRentalApplication',
  'home-rental',
  'homerental',
  'main',
  'prod',
  'dev'
];

const username = 'sanjayk23it_db_user';
const password = '4jK5oLX2cwEepRsD';

console.log('🔍 Searching for correct MongoDB Atlas cluster name...\n');

async function testClusterName(clusterName) {
  const uri = `mongodb+srv://${username}:${password}@${clusterName}.mongodb.net/home_rental?retryWrites=true&w=majority&appName=HomeRentalApplication`;
  
  console.log(`Testing: ${clusterName}.mongodb.net`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    await client.connect();
    console.log(`✅ SUCCESS! Found working cluster: ${clusterName}.mongodb.net`);
    
    // Test database operations
    const admin = client.db('admin');
    await admin.command({ ping: 1 });
    console.log('✅ Database ping successful');
    
    const databases = await admin.admin().listDatabases();
    console.log('✅ Available databases:', databases.databases.map(db => db.name));
    
    console.log(`\n🎉 WORKING CONNECTION STRING:`);
    console.log(uri);
    
    console.log(`\n📝 Update your .env file with:`);
    console.log(`MONGODB_URI=${uri}`);
    
    return true;
  } catch (error) {
    console.log(`❌ ${error.message.substring(0, 50)}...`);
    return false;
  } finally {
    await client.close();
  }
}

async function findWorkingCluster() {
  for (const clusterName of commonClusterNames) {
    const success = await testClusterName(clusterName);
    if (success) {
      return;
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ No working cluster found with common names.');
  console.log('\n🔧 To fix this issue:');
  console.log('1. Log into your MongoDB Atlas dashboard');
  console.log('2. Go to your cluster');
  console.log('3. Click "Connect" button');
  console.log('4. Choose "Connect your application"');
  console.log('5. Copy the connection string');
  console.log('6. Replace the connection string in your .env file');
  console.log('\nThe connection string should look like:');
  console.log('mongodb+srv://username:password@YOUR-ACTUAL-CLUSTER-NAME.mongodb.net/database?options');
}

findWorkingCluster().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});