const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
  // Link to the user who created the plan
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Single primary destination label (aligns with frontend)
  destination: {
    type: String,
    required: true,
  },
  // duration optional now; derived from dates in UI
  duration: {
    type: Number,
    required: false,
  },
  numberOfPeople: {
    type: Number,
    required: true,
  },
  budget: {
    type: String, // e.g., "budget", "mid-range", "luxury"
    default: '',
  },
  tripType: {
    type: String,
    enum: ['cultural', 'adventure', 'spiritual', 'nature', 'food'],
    default: 'cultural',
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  // The generated itinerary text can be saved here
  itineraryText: {
    type: String,
    default: '',
  },
  // Booking/plan status lifecycle
  status: {
    type: String,
    enum: ['planned', 'booked', 'safe', 'not_safe'],
    default: 'planned',
    index: true,
  },
  // Safety monitoring fields
  safetyMonitoring: {
    type: Boolean,
    default: false,
    index: true,
  },
  trustedContactEmail: {
    type: String,
    default: '',
  },
  lastSafetyCheck: {
    type: Date,
    default: null,
  },
  monitoringEnabled: {
    type: Boolean,
    default: false,
  },
  monitoringIntervalMinutes: {
    type: Number,
    default: 2, // demo: prompt every 1–2 mins
  },
  monitoringTimeoutMinutes: {
    type: Number,
    default: 5, // demo: auto-alert after 5–10 mins
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TripPlan = mongoose.model('TripPlan', tripPlanSchema);

module.exports = TripPlan;
