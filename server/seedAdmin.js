const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');
const { connectToMongo } = require('./db/mongoConnection');

async function ensureAdmin(email, password, name = 'Admin') {
  await connectToMongo();

  let user = await User.findOne({ email }).lean();
  if (user) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = new User({
    name,
    email,
    password_hash: passwordHash,
    role: 'admin',
    created_at: new Date(),
  });
  await admin.save();
  console.log(`Admin created: ${email}`);
}

// Run via: node server/seedAdmin.js "email" "password" "Name(optional)"
(async () => {
  try {
    const [email, password, name] = process.argv.slice(2);
    if (!email || !password) {
      console.error('Usage: node server/seedAdmin.js "email" "password" "Name(optional)"');
      process.exit(1);
    }
    await ensureAdmin(email, password, name || 'Admin');
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await mongoose.connection.close();
  }
})();


