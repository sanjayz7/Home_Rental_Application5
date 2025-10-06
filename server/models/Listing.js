const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['Apartment', 'House', 'Villa', 'Studio', 'PG']
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  furnishing: {
    type: String,
    required: true,
    enum: ['Furnished', 'Semi-furnished', 'Unfurnished']
  },
  amenities: [{
    type: String
  }],
  availableFor: {
    type: String,
    required: true,
    enum: ['Family', 'Bachelors', 'Any']
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'rented', 'unavailable', 'pending_sale'],
    default: 'available'
  },
  depositAmount: {
    type: Number,
    required: true,
    min: 0
  },
  availableUnits: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  images: [{
    type: String,
    required: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  area_sqft: { type: Number },
  furnished: { type: String },
  verified: { type: Boolean, default: false },
  deposit: { type: Number },
  available_from: { type: Date },
  contact_start: { type: String },
  contact_end: { type: String },
  price: { type: Number, required: true },
  total_units: { type: Number, default: 1 },
  available_units: { type: Number, default: 1 },
  city: { type: String },
  category: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
}, { collection: 'listings' });

// Create indexes
ListingSchema.index({ location: '2dsphere' });
ListingSchema.index({ city: 1 });
ListingSchema.index({ price: 1 });

module.exports = mongoose.model('Listing', ListingSchema);