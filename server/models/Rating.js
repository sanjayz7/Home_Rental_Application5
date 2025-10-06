const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  listing_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  created_at: { type: Date, default: Date.now }
}, { collection: 'ratings' });

// Create compound index to prevent duplicate ratings
RatingSchema.index({ listing_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);