require('dotenv').config();
const mongoose = require('mongoose');
const { User, Listing } = require('./models');
const bcrypt = require('bcryptjs');

const sampleOwner = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  password: 'owner123',
  role: 'owner'
};

const sampleListings = [
  {
    title: 'Luxury Villa with Garden',
    description: 'Beautiful villa with spacious garden and modern amenities. Perfect for family living with excellent security and peaceful neighborhood. Features include a large living room, modern kitchen, servant quarters, and ample parking space.',
    price: 45000,
    location: 'Coimbatore, Tamil Nadu',
    propertyType: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    furnishing: 'Semi-furnished',
    amenities: [
      'Private Garden',
      'Servant Quarters',
      'Full Power Backup',
      'Security',
      'Parking',
      'Children\'s Play Area',
      'CCTV Surveillance'
    ],
    availableFor: 'Family',
    depositAmount: 90000,
    images: [
      '/sample-properties/House2.jpg',
      '/sample-properties/House2_Front.jpg',
      '/sample-properties/House2_Hall.jpg',
      '/sample-properties/House2_Kitchen.jpg',
      '/sample-properties/House2_MainHAll.jpg'
    ]
  }
    description: 'Perfect for bachelors or small family',
    price: 15000,
    location: 'Medavakkam, Tamil Nadu',
    propertyType: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    furnishing: 'Furnished',
    amenities: ['Balcony', 'Security', "Children's Play Area"],
    availableFor: 'Any',
    depositAmount: 30000,
    images: ['/sample-properties/BedRoom1.jpg', '/sample-properties/BathRoom.jpg', '/sample-properties/Kitchen.jpg']
  },
  {
    title: 'Family House with Balcony',
    description: 'Spacious house with modern kitchen and balcony',
    price: 35000,
    location: 'Velachery, Tamil Nadu',
    propertyType: 'House',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    furnishing: 'Semi-furnished',
    amenities: ['Balcony', 'Parking', 'Kitchen'],
    availableFor: 'Family',
    depositAmount: 75000,
    images: ['/sample-properties/House3.jpg', '/sample-properties/Balcony.jpg', '/sample-properties/Kitchen.jpg']
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create owner account
    const hashedPassword = await bcrypt.hash(sampleOwner.password, 10);
    const owner = await User.create({
      name: sampleOwner.name,
      email: sampleOwner.email,
      password_hash: hashedPassword,
      role: sampleOwner.role
    });
    console.log('Created sample owner account');

    // Create listings
    const listingsWithOwner = sampleListings.map(listing => ({
      ...listing,
      owner: owner._id,
      status: 'available',
      availableUnits: 1,
      created_at: new Date()
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log('Created sample listings');

    console.log('Sample data seeded successfully!');
    console.log('Owner login credentials:');
    console.log('Email:', sampleOwner.email);
    console.log('Password:', sampleOwner.password);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedData();