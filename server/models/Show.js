const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  venue: { type: String },
  show_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String },
  price: { type: Number, required: true },
  total_seats: { type: Number, default: 100 },
  available_seats: { type: Number },
  image_url: { type: String },
  category: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
}, { collection: 'shows' });

ShowSchema.index({ show_date: 1, start_time: 1 });

module.exports = mongoose.model('Show', ShowSchema);