const { MongoClient } = require('mongodb');

// Test different credential combinations
const credentialOptions = [
  {
    username: 'sanjayk23it_db_user',
    password: '4jK5oLX2cwEepRsD',
    description: 'Original credentials from your message'
  },
  {
    username: 'sanjayk91948',
    password: '4jK5oLX2cwEepRsD',
    description: 'Username from screenshot, password from message'
  }
];

const cluster = 'home.h9cdruk.mongodb.net';

async function testCredential(cred) {
  const uri = `mongodb+srv://${cred.username}:${cred.password}@${cluster}/home_rental?retryWrites=true&w=majority&appName=HomeRentalApplication`;
  
  console.log(`\n🔗 Testing: ${cred.description}`);
  console.log(`Username: ${cred.username}`);
  console.log(`Password: ${cred.password.substring(0, 3)}***`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    await client.connect();
    console.log('✅ SUCCESS! These credentials work!');
    
    // Quick database test
    const admin = client.db('admin');
    await admin.command({ ping: 1 });
    console.log('✅ Database ping successful');
    
    console.log(`\n🎉 WORKING CONNECTION STRING:`);
    console.log(uri);
    
    console.log(`\n📝 Update your .env file with:`);
    console.log(`MONGODB_URI=${uri}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  } finally {
    await client.close();
  }
}

async function findWorkingCredentials() {
  console.log('🔍 Testing different credential combinations...\n');
  
  for (const cred of credentialOptions) {
    const success = await testCredential(cred);
    if (success) {
      return;
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ None of the credential combinations worked.');
  console.log('\n🔧 To fix this:');
  console.log('1. Go to your MongoDB Atlas dashboard');
  console.log('2. Navigate to Database Access');
  console.log('3. Find your database user');
  console.log('4. Note the exact username');
  console.log('5. If needed, reset the password');
  console.log('6. Ensure the user has "Read and write to any database" permissions');
  console.log('7. Check that Network Access allows your IP address (0.0.0.0/0 for any IP)');
}

findWorkingCredentials().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});