// Sample house data with owner details
export const sampleHouses = [
  {
    SHOW_ID: 1,
    LISTING_ID: 1,
    TITLE: "Modern 2BHK Apartment in Downtown",
    DESCRIPTION: "Beautiful modern apartment with all amenities. Close to metro station and shopping centers. Perfect for professionals and small families.",
    PRICE: 1500,
    ADDRESS: "123 Downtown Street, Central City",
    BEDROOMS: 2,
    BATHROOMS: 2,
    AREA_SQFT: 1200,
    FURNISHED: "Semi-Furnished",
    CATEGORY: "Apartment",
    SHOW_DATE: "2024-01-15",
    AVAILABLE_SEATS: 1,
    AVAILABLE_UNITS: 1,
    VERIFIED: true,
    LATITUDE: 40.7128,
    LONGITUDE: -74.0060,
    IMAGE_URL: "/sample-properties/apartment1.jpg",
    CREATED_AT: "2024-01-01T10:00:00Z",
    UPDATED_AT: "2024-01-01T10:00:00Z",
    status: "available",
    // Owner Details - John Smith
    owner: {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1-555-0123",
      address: "456 Oak Avenue, Central City",
      bio: "Professional property owner with 5 years experience in real estate. Committed to providing quality housing solutions.",
      verified: true,
      totalProperties: 3,
      joinedDate: "2019-03-15"
    },
    location: "Downtown, Central City - Near metro station, shopping malls, and business district"
  },
  {
    SHOW_ID: 2,
    LISTING_ID: 2,
    TITLE: "Spacious 3BHK House with Garden",
    DESCRIPTION: "Large family house with private garden and parking. Quiet neighborhood with good schools nearby. Ideal for families with children.",
    PRICE: 2200,
    ADDRESS: "789 Garden Lane, Suburb Heights",
    BEDROOMS: 3,
    BATHROOMS: 3,
    AREA_SQFT: 1800,
    FURNISHED: "Unfurnished",
    CATEGORY: "House",
    SHOW_DATE: "2024-01-20",
    AVAILABLE_SEATS: 1,
    AVAILABLE_UNITS: 1,
    VERIFIED: true,
    LATITUDE: 40.7580,
    LONGITUDE: -73.9855,
    IMAGE_URL: "/sample-properties/house1.jpg",
    CREATED_AT: "2024-01-02T11:30:00Z",
    UPDATED_AT: "2024-01-02T11:30:00Z",
    status: "available",
    // Owner Details - Maria Rodriguez
    owner: {
      id: 2,
      name: "Maria Rodriguez",
      email: "maria.rodriguez@example.com",
      phone: "+1-555-0456",
      address: "321 Pine Street, Suburb Heights",
      bio: "Dedicated property manager specializing in family homes. Focuses on creating safe and comfortable living environments.",
      verified: true,
      totalProperties: 2,
      joinedDate: "2020-07-22"
    },
    location: "Suburb Heights - Family-friendly neighborhood with schools, parks, and community center"
  },
  {
    SHOW_ID: 3,
    LISTING_ID: 3,
    TITLE: "Luxury Studio in Business District",
    DESCRIPTION: "Premium studio apartment with modern amenities. Perfect for young professionals. Building includes gym, rooftop terrace, and 24/7 security.",
    PRICE: 1800,
    ADDRESS: "456 Corporate Plaza, Business District",
    BEDROOMS: 0,
    BATHROOMS: 1,
    AREA_SQFT: 650,
    FURNISHED: "Fully Furnished",
    CATEGORY: "Studio",
    SHOW_DATE: "2024-01-25",
    AVAILABLE_SEATS: 1,
    AVAILABLE_UNITS: 1,
    VERIFIED: true,
    LATITUDE: 40.7589,
    LONGITUDE: -73.9851,
    IMAGE_URL: "/sample-properties/studio1.jpg",
    CREATED_AT: "2024-01-03T09:15:00Z",
    UPDATED_AT: "2024-01-03T09:15:00Z",
    status: "available",
    // Owner Details - David Chen
    owner: {
      id: 3,
      name: "David Chen",
      email: "david.chen@example.com",
      phone: "+1-555-0789",
      address: "654 Luxury Avenue, Business District",
      bio: "Property investment specialist with focus on premium locations. Committed to maintaining high-quality living standards.",
      verified: true,
      totalProperties: 5,
      joinedDate: "2018-11-08"
    },
    location: "Business District - Walking distance to major offices, restaurants, and public transportation"
  },
  {
    SHOW_ID: 4,
    LISTING_ID: 4,
    TITLE: "Cozy 1BHK Near University",
    DESCRIPTION: "Perfect for students or single professionals. Close to university campus and public transport. Quiet study-friendly environment with good internet connectivity.",
    PRICE: 900,
    ADDRESS: "321 College Road, University Area",
    BEDROOMS: 1,
    BATHROOMS: 1,
    AREA_SQFT: 750,
    FURNISHED: "Semi-Furnished",
    CATEGORY: "Apartment",
    SHOW_DATE: "2024-02-01",
    AVAILABLE_SEATS: 1,
    AVAILABLE_UNITS: 1,
    VERIFIED: false,
    LATITUDE: 40.7505,
    LONGITUDE: -73.9934,
    IMAGE_URL: "/sample-properties/apartment2.jpg",
    CREATED_AT: "2024-01-04T14:20:00Z",
    UPDATED_AT: "2024-01-04T14:20:00Z",
    status: "available",
    // Owner Details - Sarah Johnson
    owner: {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1-555-0147",
      address: "987 University Boulevard, University Area",
      bio: "Former university administrator turned property owner. Understands the needs of students and young professionals.",
      verified: false,
      totalProperties: 1,
      joinedDate: "2023-09-12"
    },
    location: "University Area - Close to campus, libraries, cafes, and student services"
  }
];

// Function to get house by ID
export const getHouseById = (id) => {
  return sampleHouses.find(house => house.SHOW_ID === parseInt(id) || house.LISTING_ID === parseInt(id));
};

// Function to get all houses
export const getAllHouses = () => {
  return sampleHouses;
};

// Function to get owner by house ID
export const getOwnerByHouseId = (id) => {
  const house = getHouseById(id);
  return house ? house.owner : null;
};

// Function to get houses by owner email (for owner dashboard)
export const getHousesByOwnerEmail = (email) => {
  return sampleHouses.filter(house => house.owner.email === email);
};