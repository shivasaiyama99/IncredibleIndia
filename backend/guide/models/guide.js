const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  destination: { type: String, required: true, index: true },
  pricePerTrip: { type: Number, required: true },
}, { _id: false });

const guideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  bio: { type: String, default: '' },
  services: { type: [serviceSchema], default: [] },
  languages: { type: [String], default: [] },
  location: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true, index: true },
}, { timestamps: true });

guideSchema.index({ 'services.destination': 1 });

module.exports = mongoose.model('Guide', guideSchema);


