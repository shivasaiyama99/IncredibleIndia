const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const Booking = require('../models/booking');
const TripPlan = require('../models/tripPlan');
const User = require('../models/user');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

router.post('/alert', auth, async (req, res) => {
  try {
    // Accept flexible payload: bookingId OR explicit fields
    const { bookingId, userId, tripId, trustedContactEmail, destination } = req.body || {};
    let to = trustedContactEmail;
    let dest = destination;

    if (bookingId) {
      const b = await Booking.findOne({ _id: bookingId, user: req.user.id });
      if (!b) return res.status(404).json({ message: 'Booking not found' });
      to = to || b.trustedContactEmail;
      dest = dest || b.destination;
    } else if (tripId) {
      const p = await TripPlan.findOne({ _id: tripId, user: req.user.id });
      if (!p) return res.status(404).json({ message: 'Trip plan not found' });
      to = to || p.trustedContactEmail;
      dest = dest || p.destination;
    }

    if (!to) return res.status(400).json({ message: 'trustedContactEmail required' });

    const subject = `🚨 Safety Alert`;
    const text = `The user has not confirmed their safety during their trip to ${dest || 'the destination'}. Please try contacting them immediately.`;
    console.log('Attempting to send safety alert email →', to, subject);
    const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    console.log('Email sent:', info?.messageId || 'ok');
    return res.json({ message: 'Alert email sent' });
  } catch (e) {
    console.error('Safety alert email error:', e);
    res.status(500).json({ message: 'Failed to send alert email' });
  }
});

// New: Emergency SOS route — sends immediate alert to trusted contact
router.post('/sos', auth, async (req, res) => {
  try {
    const { bookingId, location } = req.body || {};
    // Identify target booking to get trusted contact
    let booking = null;
    if (bookingId) {
      booking = await Booking.findOne({ _id: bookingId, user: req.user.id });
    } else {
      // fallback: latest booking with safety monitoring enabled for this user
      booking = await Booking.findOne({ user: req.user.id, safetyMonitoring: true }).sort({ createdAt: -1 });
    }
    if (!booking || !booking.trustedContactEmail) {
      return res.status(400).json({ message: 'Trusted contact not set for any active booking.' });
    }
    // Fetch user for context lines
    let user = null;
    try { user = await User.findById(req.user.id).lean(); } catch {}
    const timestamp = new Date().toISOString();
    const subject = '🚨 Emergency SOS';
    const lines = [
      'The traveler has triggered an EMERGENCY SOS alert.',
      `Time: ${timestamp}`,
      `Traveler: ${user?.name || 'Unknown'} (${user?.email || 'unknown'})`,
      `Trip: ${booking.destination || 'N/A'}`,
    ];
    if (location) lines.push(`Last known location: ${location}`);
    const text = lines.join('\n');
    await transporter.sendMail({ from: process.env.EMAIL_USER, to: booking.trustedContactEmail, subject, text });
    return res.json({ message: 'SOS alert sent' });
  } catch (e) {
    console.error('SOS alert error:', e);
    res.status(500).json({ message: 'Failed to send SOS alert' });
  }
});

module.exports = router;


