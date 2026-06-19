const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: { type: String, required: true },
  destinations: { type: [String], default: [] },
  numberOfPeople: { type: Number, required: true },
  budget: { type: String, default: '' },
  tripType: { type: String, enum: ['cultural', 'adventure', 'spiritual', 'nature', 'food'], default: 'cultural' },
  itineraryText: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  safetyMonitoring: { type: Boolean, default: false },
  trustedContactEmail: { type: String, default: '' },
  // Added: user-preferred safety check interval in minutes
  safetyFrequencyMinutes: { type: Number, default: 3, min: 1 },
  lastSafetyCheck: { type: Date, default: null },
  status: { type: String, enum: ['booked', 'safe', 'not_safe'], default: 'booked', index: true },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;


