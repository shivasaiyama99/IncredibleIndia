const Guide = require('../models/guide');
const GuideBooking = require('../models/booking');

exports.createBooking = async (req, res) => {
  try {
    const { guideId, date, notes = '' } = req.body;
    if (!guideId || !date) return res.status(400).json({ message: 'guideId and date are required' });
    const guide = await Guide.findById(guideId);
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    const booking = await GuideBooking.create({ user: req.user.id, guide: guide._id, date: new Date(date), notes });
    res.status(201).json({ booking });
  } catch (e) {
    console.error('Create guide booking error', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGuideBookings = async (req, res) => {
  try {
    if (req.user.role !== 'guide') return res.status(403).json({ message: 'Forbidden' });
    const guide = await Guide.findOne({ user: req.user.id });
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });
    const bookings = await GuideBooking.find({ guide: guide._id })
      .populate({ path: 'user', select: 'name email phone' })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (e) {
    console.error('Get guide bookings error', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await GuideBooking.find({ user: req.user.id })
      .populate({ path: 'guide', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (e) {
    console.error('Get my guide bookings error', e);
    res.status(500).json({ message: 'Server error' });
  }
};


