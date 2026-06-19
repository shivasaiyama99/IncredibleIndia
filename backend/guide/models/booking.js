const mongoose = require('mongoose');

const guideBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending', index: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('GuideBooking', guideBookingSchema);


