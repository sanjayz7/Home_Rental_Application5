const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  listing_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  url: { type: String, required: true },
  name: { type: String },
  size: { type: Number },
  width: { type: Number },
  height: { type: Number },
  is_primary: { type: Boolean, default: false },
  sort_order: { type: Number },
  created_at: { type: Date, default: Date.now }
}, { collection: 'images' });

// Create compound index for listing images
ImageSchema.index({ listing_id: 1, sort_order: 1 });

module.exports = mongoose.model('Image', ImageSchema);