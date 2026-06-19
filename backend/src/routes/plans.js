const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TripPlan = require('../models/tripPlan');
const Booking = require('../models/booking');

// Unified plans endpoint: returns both planned trip plans and booked trips
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [plans, bookings] = await Promise.all([
      TripPlan.find({ user: userId }).lean(),
      Booking.find({ user: userId }).lean(),
    ]);

    // Normalize fields for UI
    const normalizedPlans = [
      ...plans.map((p) => ({
        _id: p._id,
        destination: p.destination,
        numberOfPeople: p.numberOfPeople,
        budget: p.budget,
        tripType: p.tripType,
        itineraryText: p.itineraryText,
        startDate: p.startDate,
        endDate: p.endDate,
        safetyMonitoring: p.safetyMonitoring,
        trustedContactEmail: p.trustedContactEmail,
        lastSafetyCheck: p.lastSafetyCheck,
        status: p.status || 'planned',
        createdAt: p.createdAt,
        destinations: p.destinations || [],
        source: 'plan',
      })),
      ...bookings.map((b) => ({
        _id: b._id,
        destination: b.destination,
        numberOfPeople: b.numberOfPeople,
        budget: b.budget,
        tripType: b.tripType,
        itineraryText: b.itineraryText,
        startDate: b.startDate,
        endDate: b.endDate,
        safetyMonitoring: b.safetyMonitoring,
        trustedContactEmail: b.trustedContactEmail,
        lastSafetyCheck: b.lastSafetyCheck,
        status: b.status || 'booked',
        createdAt: b.createdAt,
        destinations: Array.isArray(b.destinations) ? b.destinations : [],
        source: 'booking',
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ plans: normalizedPlans });
  } catch (e) {
    console.error('Unified plans fetch error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Added: Delete plan route - removes plan and cancels pending alerts
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Try to find in TripPlan first
    const plan = await TripPlan.findOne({ _id: id, user: userId });
    if (plan) {
      await TripPlan.deleteOne({ _id: id, user: userId });
      return res.json({ message: 'Plan deleted successfully', source: 'plan' });
    }

    // Try to find in Booking
    const booking = await Booking.findOne({ _id: id, user: userId });
    if (booking) {
      // Note: Deleting booking will also cancel any scheduled safety checks
      // since the safety check logic looks for active bookings
      await Booking.deleteOne({ _id: id, user: userId });
      return res.json({ message: 'Booking deleted successfully', source: 'booking' });
    }

    // Not found in either collection
    return res.status(404).json({ message: 'Plan not found' });
  } catch (e) {
    console.error('Delete plan error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


