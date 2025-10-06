require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'owner'], default: 'user' },
  phone: String,
  address: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  address: { type: String, required: true },
  city: String,
  state: String,
  zipCode: String,
  rent: { type: Number, required: true },
  bedrooms: Number,
  bathrooms: Number,
  area: Number, // in sq ft
  amenities: [String],
  images: [String],
  ownerEmail: { type: String, required: true },
  ownerName: String,
  ownerPhone: String,
  verified: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now }
});

const BookingSchema = new mongoose.Schema({
  listingId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: String,
  ownerEmail: String,
  startDate: Date,
  endDate: Date,
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'paid' },
  specialRequests: String,
  createdAt: { type: Date, default: Date.now }
});

const PropertyRequestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: String,
  userPhone: String,
  requestType: String,
  location: String,
  budget: Number,
  bedrooms: Number,
  amenities: [String],
  description: String,
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', UserSchema);
const Listing = mongoose.model('Listing', ListingSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const PropertyRequest = mongoose.model('PropertyRequest', PropertyRequestSchema);

// Sample Data
const createSampleData = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Booking.deleteMany({});
    await PropertyRequest.deleteMany({});

    console.log('🔐 Creating admin user...');
    // Admin user with your specified credentials
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'sanjayk.2345it@kongu.edu',
      password: adminPassword,
      name: 'Sanjay K - Admin',
      role: 'admin',
      phone: '+91 9876543210',
      address: 'Kongu Engineering College, Perundurai, Tamil Nadu',
      verified: true
    });

    console.log('👥 Creating sample users...');
    const userPassword = await bcrypt.hash('user123', 10);
    const users = [
      {
        email: 'john.doe@gmail.com',
        password: userPassword,
        name: 'John Doe',
        role: 'user',
        phone: '+91 9876543211',
        address: '123 MG Road, Bengaluru, Karnataka',
        verified: true
      },
      {
        email: 'priya.sharma@gmail.com',
        password: userPassword,
        name: 'Priya Sharma',
        role: 'user',
        phone: '+91 9876543212',
        address: '456 Anna Nagar, Chennai, Tamil Nadu',
        verified: true
      },
      {
        email: 'amit.patel@gmail.com',
        password: userPassword,
        name: 'Amit Patel',
        role: 'user',
        phone: '+91 9876543213',
        address: '789 Satellite, Ahmedabad, Gujarat',
        verified: true
      },
      {
        email: 'neha.gupta@gmail.com',
        password: userPassword,
        name: 'Neha Gupta',
        role: 'user',
        phone: '+91 9876543214',
        address: '321 Connaught Place, New Delhi',
        verified: true
      },
      {
        email: 'rajesh.kumar@gmail.com',
        password: userPassword,
        name: 'Rajesh Kumar',
        role: 'user',
        phone: '+91 9876543215',
        address: '654 Park Street, Kolkata, West Bengal',
        verified: true
      }
    ];
    await User.insertMany(users);

    console.log('🏠 Creating property owners...');
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const owners = [
      {
        email: 'ramesh.property@gmail.com',
        password: ownerPassword,
        name: 'Ramesh Reddy',
        role: 'owner',
        phone: '+91 9876543216',
        address: 'Jubilee Hills, Hyderabad, Telangana',
        verified: true
      },
      {
        email: 'lakshmi.homes@gmail.com',
        password: ownerPassword,
        name: 'Lakshmi Venkatesh',
        role: 'owner',
        phone: '+91 9876543217',
        address: 'Indiranagar, Bengaluru, Karnataka',
        verified: true
      },
      {
        email: 'david.estates@gmail.com',
        password: ownerPassword,
        name: 'David Wilson',
        role: 'owner',
        phone: '+91 9876543218',
        address: 'Banjara Hills, Hyderabad, Telangana',
        verified: true
      },
      {
        email: 'meera.rentals@gmail.com',
        password: ownerPassword,
        name: 'Meera Krishnan',
        role: 'owner',
        phone: '+91 9876543219',
        address: 'T. Nagar, Chennai, Tamil Nadu',
        verified: true
      },
      {
        email: 'sunil.properties@gmail.com',
        password: ownerPassword,
        name: 'Sunil Agarwal',
        role: 'owner',
        phone: '+91 9876543220',
        address: 'Koramangala, Bengaluru, Karnataka',
        verified: true
      }
    ];
    await User.insertMany(owners);

    console.log('🏘️ Creating property listings...');
    const listings = [
      {
        title: 'Luxury 3BHK Apartment in Jubilee Hills',
        description: 'Spacious and well-furnished apartment with modern amenities, perfect for families. Located in prime area with excellent connectivity.',
        address: '12-34/A, Road No. 36, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500033',
        rent: 45000,
        bedrooms: 3,
        bathrooms: 3,
        area: 1800,
        amenities: ['Air Conditioning', 'Parking', 'Security', 'Gym', 'Swimming Pool', 'Power Backup'],
        images: ['/images/apartment1.jpg', '/images/apartment1_2.jpg'],
        ownerEmail: 'ramesh.property@gmail.com',
        ownerName: 'Ramesh Reddy',
        ownerPhone: '+91 9876543216',
        verified: true,
        available: true,
        latitude: 17.4326,
        longitude: 78.4071
      },
      {
        title: 'Modern 2BHK in Indiranagar',
        description: 'Contemporary apartment with all modern facilities. Close to metro station and shopping centers.',
        address: '45, 100 Feet Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560038',
        rent: 35000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        amenities: ['Air Conditioning', 'Parking', 'Security', 'Internet', 'Balcony'],
        images: ['/images/apartment2.jpg', '/images/apartment2_2.jpg'],
        ownerEmail: 'lakshmi.homes@gmail.com',
        ownerName: 'Lakshmi Venkatesh',
        ownerPhone: '+91 9876543217',
        verified: true,
        available: true,
        latitude: 12.9784,
        longitude: 77.6408
      },
      {
        title: 'Premium Villa in Banjara Hills',
        description: 'Independent villa with garden, perfect for large families. Premium location with 24/7 security.',
        address: '78, Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500034',
        rent: 75000,
        bedrooms: 4,
        bathrooms: 4,
        area: 2800,
        amenities: ['Air Conditioning', 'Parking', 'Security', 'Garden', 'Power Backup', 'Maid Room'],
        images: ['/images/villa1.jpg', '/images/villa1_2.jpg'],
        ownerEmail: 'david.estates@gmail.com',
        ownerName: 'David Wilson',
        ownerPhone: '+91 9876543218',
        verified: true,
        available: true,
        latitude: 17.4065,
        longitude: 78.4691
      },
      {
        title: 'Cozy 1BHK in T. Nagar',
        description: 'Compact and efficient apartment ideal for working professionals. Great location with easy access to transport.',
        address: '23, Usman Road, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600017',
        rent: 18000,
        bedrooms: 1,
        bathrooms: 1,
        area: 650,
        amenities: ['Air Conditioning', 'Internet', 'Security', 'Power Backup'],
        images: ['/images/apartment3.jpg'],
        ownerEmail: 'meera.rentals@gmail.com',
        ownerName: 'Meera Krishnan',
        ownerPhone: '+91 9876543219',
        verified: true,
        available: true,
        latitude: 13.0418,
        longitude: 80.2341
      },
      {
        title: 'Spacious 2BHK in Koramangala',
        description: 'Well-ventilated apartment in the heart of Koramangala. Close to offices and entertainment hubs.',
        address: '56, 5th Block, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560095',
        rent: 32000,
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        amenities: ['Air Conditioning', 'Parking', 'Internet', 'Balcony', 'Security'],
        images: ['/images/apartment4.jpg', '/images/apartment4_2.jpg'],
        ownerEmail: 'sunil.properties@gmail.com',
        ownerName: 'Sunil Agarwal',
        ownerPhone: '+91 9876543220',
        verified: true,
        available: true,
        latitude: 12.9352,
        longitude: 77.6245
      },
      {
        title: 'Budget-Friendly Studio in Kondapur',
        description: 'Affordable studio apartment perfect for students and young professionals.',
        address: '89, HITEC City Road, Kondapur',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500084',
        rent: 12000,
        bedrooms: 1,
        bathrooms: 1,
        area: 450,
        amenities: ['Internet', 'Security', 'Power Backup'],
        images: ['/images/studio1.jpg'],
        ownerEmail: 'ramesh.property@gmail.com',
        ownerName: 'Ramesh Reddy',
        ownerPhone: '+91 9876543216',
        verified: false,
        available: true,
        latitude: 17.4569,
        longitude: 78.3677
      },
      {
        title: 'Luxury Penthouse in Whitefield',
        description: 'Premium penthouse with panoramic city views. Top-tier amenities and prime location.',
        address: '12, Brigade Gateway, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560066',
        rent: 85000,
        bedrooms: 3,
        bathrooms: 3,
        area: 2200,
        amenities: ['Air Conditioning', 'Parking', 'Security', 'Gym', 'Swimming Pool', 'Terrace Garden'],
        images: ['/images/penthouse1.jpg', '/images/penthouse1_2.jpg'],
        ownerEmail: 'lakshmi.homes@gmail.com',
        ownerName: 'Lakshmi Venkatesh',
        ownerPhone: '+91 9876543217',
        verified: true,
        available: false
      }
    ];
    await Listing.insertMany(listings);

    console.log('📝 Creating sample bookings...');
    const bookings = [
      {
        listingId: '1',
        userEmail: 'john.doe@gmail.com',
        userName: 'John Doe',
        ownerEmail: 'ramesh.property@gmail.com',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-07-15'),
        amount: 0, // Zero fee booking
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequests: 'Need parking space for 2 cars'
      },
      {
        listingId: '2',
        userEmail: 'priya.sharma@gmail.com',
        userName: 'Priya Sharma',
        ownerEmail: 'lakshmi.homes@gmail.com',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-01'),
        amount: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequests: 'Pet-friendly accommodation needed'
      },
      {
        listingId: '3',
        userEmail: 'amit.patel@gmail.com',
        userName: 'Amit Patel',
        ownerEmail: 'david.estates@gmail.com',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-01'),
        amount: 0,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequests: 'Family with children, need safety measures'
      },
      {
        listingId: '4',
        userEmail: 'neha.gupta@gmail.com',
        userName: 'Neha Gupta',
        ownerEmail: 'meera.rentals@gmail.com',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-06-20'),
        amount: 0,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        listingId: '5',
        userEmail: 'rajesh.kumar@gmail.com',
        userName: 'Rajesh Kumar',
        ownerEmail: 'sunil.properties@gmail.com',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-10-01'),
        amount: 0,
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: 'Working from home setup needed'
      }
    ];
    await Booking.insertMany(bookings);

    console.log('🏠 Creating property requests...');
    const propertyRequests = [
      {
        userEmail: 'john.doe@gmail.com',
        userName: 'John Doe',
        userPhone: '+91 9876543211',
        requestType: 'Apartment',
        location: 'Gachibowli, Hyderabad',
        budget: 40000,
        bedrooms: 2,
        amenities: ['Gym', 'Swimming Pool', 'Parking'],
        description: 'Looking for a modern apartment close to IT companies',
        urgency: 'high',
        status: 'pending'
      },
      {
        userEmail: 'priya.sharma@gmail.com',
        userName: 'Priya Sharma',
        userPhone: '+91 9876543212',
        requestType: 'Villa',
        location: 'ECR, Chennai',
        budget: 60000,
        bedrooms: 3,
        amenities: ['Garden', 'Pet-friendly', 'Security'],
        description: 'Independent villa with garden space for pets',
        urgency: 'medium',
        status: 'processing'
      },
      {
        userEmail: 'amit.patel@gmail.com',
        userName: 'Amit Patel',
        userPhone: '+91 9876543213',
        requestType: 'Penthouse',
        location: 'Powai, Mumbai',
        budget: 80000,
        bedrooms: 3,
        amenities: ['Lake View', 'Terrace', 'Premium Location'],
        description: 'Luxury penthouse with lake view',
        urgency: 'low',
        status: 'pending'
      },
      {
        userEmail: 'neha.gupta@gmail.com',
        userName: 'Neha Gupta',
        userPhone: '+91 9876543214',
        requestType: 'Studio',
        location: 'Cyber City, Gurgaon',
        budget: 25000,
        bedrooms: 1,
        amenities: ['Internet', 'Power Backup', 'Security'],
        description: 'Compact studio for working professional',
        urgency: 'high',
        status: 'completed'
      }
    ];
    await PropertyRequest.insertMany(propertyRequests);

    console.log('✅ Sample data created successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('🔐 ADMIN LOGIN:');
    console.log('   Email: sanjayk.2345it@kongu.edu');
    console.log('   Password: admin123');
    console.log('\n👤 SAMPLE USER LOGINS:');
    console.log('   Email: john.doe@gmail.com | Password: user123');
    console.log('   Email: priya.sharma@gmail.com | Password: user123');
    console.log('   Email: amit.patel@gmail.com | Password: user123');
    console.log('\n🏠 SAMPLE OWNER LOGINS:');
    console.log('   Email: ramesh.property@gmail.com | Password: owner123');
    console.log('   Email: lakshmi.homes@gmail.com | Password: owner123');
    console.log('   Email: david.estates@gmail.com | Password: owner123');
    console.log('\n📊 DATA SUMMARY:');
    console.log(`   • Total Users: ${users.length + owners.length + 1}`);
    console.log(`   • Total Listings: ${listings.length}`);
    console.log(`   • Total Bookings: ${bookings.length}`);
    console.log(`   • Property Requests: ${propertyRequests.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
const main = async () => {
  console.log('🚀 Starting Sample Data Setup for Home Rental Application');
  console.log('🔗 Connecting to MongoDB Atlas...');
  
  await connectDB();
  await createSampleData();
  
  console.log('🎉 Sample data setup completed successfully!');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});