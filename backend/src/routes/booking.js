const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/booking');
const User = require('../models/user');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendAlert(booking, reason) {
  if (!booking.trustedContactEmail) return;
  const subject = `Safety Alert for ${booking.destination}`;
  let userLine = '';
  try {
    const user = await User.findById(booking.user).lean();
    if (user) {
      userLine = `\nTraveler: ${user.name} (${user.email}${user.phone ? ", "+user.phone : ''})`;
    }
  } catch {}
  const text = `Reason: ${reason}\nTrip: ${booking.destination}\nDates: ${booking.startDate} → ${booking.endDate}\nStatus: ${booking.status}${userLine}`;
  console.log('Sending email to', booking.trustedContactEmail, 'subject:', subject);
  await transporter.sendMail({ from: process.env.EMAIL_USER, to: booking.trustedContactEmail, subject, text });
}

// Create a new booking from payload (already validated client-side)
router.post('/', auth, async (req, res) => {
  try {
    const { destination, numberOfPeople, budget, tripType, itineraryText, startDate, endDate, safetyMonitoring, trustedContactEmail, selectedDestinations, safetyFrequencyMinutes } = req.body;
    if (!destination || !startDate || !endDate || !numberOfPeople) {
      return res.status(400).json({ message: 'destination, dates, numberOfPeople required' });
    }
    const destinations = Array.isArray(selectedDestinations)
      ? selectedDestinations.map(d => (typeof d === 'string' ? d : (d?.name || '') )).filter(Boolean)
      : [];
    const booking = new Booking({
      user: req.user.id,
      destination,
      destinations,
      numberOfPeople,
      budget: budget || '',
      tripType: tripType || 'cultural',
      itineraryText: itineraryText || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      safetyMonitoring: !!safetyMonitoring,
      trustedContactEmail: trustedContactEmail || '',
      // Persist preferred safety check frequency if provided; schema default handles fallback
      safetyFrequencyMinutes: typeof safetyFrequencyMinutes === 'number' ? safetyFrequencyMinutes : undefined,
      status: 'booked',
    });
    await booking.save();

    // New: Send booking confirmation email to the user (non-blocking failure)
    try {
      const user = await User.findById(req.user.id).lean();
      if (user?.email) {
        const subject = `✅ Booking Confirmed: ${booking.destination}`;
        const text = [
          `Hello ${user.name || 'Traveler'},`,
          '',
          `Your booking is confirmed!`,
          `Booking ID: ${booking._id}`,
          `Destination: ${booking.destination}`,
          `Dates: ${booking.startDate.toISOString()} → ${booking.endDate.toISOString()}`,
          '',
          `Need help? Contact support at ${process.env.SUPPORT_EMAIL || 'support@example.com'}.`,
        ].join('\n');
        await transporter.sendMail({ from: process.env.EMAIL_USER, to: user.email, subject, text });
      }
    } catch (e) {
      console.error('Booking confirmation email error:', e);
      // Do not fail the booking response if email sending fails
    }
    res.status(201).json({ booking });
  } catch (e) {
    console.error('Create booking error', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// List bookings for user
router.get('/', auth, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ bookings });
});

// Safety respond for booking
router.post('/:id/safety', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const booking = await Booking.findOne({ _id: id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (response === 'yes') {
      booking.status = 'safe';
      booking.lastSafetyCheck = new Date();
      await booking.save();
      return res.json({ booking });
    }
    if (response === 'no') {
      booking.status = 'not_safe';
      booking.lastSafetyCheck = new Date();
      await booking.save();
      try { await sendAlert(booking, 'User reported not safe'); } catch (e) { console.error('Email error', e); }
      return res.json({ booking });
    }
    res.status(400).json({ message: 'Invalid response' });
  } catch (e) {
    console.error('Safety response error', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Immediate alert route
router.post('/:id/alert', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await sendAlert(booking, 'No response within 5 minutes');
    res.json({ message: 'Alert sent' });
  } catch (e) {
    console.error('Alert send error', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Added: Hotel booking route with email confirmation for luxury accommodations
router.post('/hotel', auth, async (req, res) => {
  try {
    const { hotelName, hotelLocation, checkInDate, checkOutDate, duration, price } = req.body;
    if (!hotelName || !hotelLocation || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Hotel details and dates are required' });
    }

    // Fetch user details for email
    const user = await User.findById(req.user.id).lean();
    if (!user || !user.email) {
      return res.status(400).json({ message: 'User email not found' });
    }

    // Send confirmation email using existing Nodemailer transporter
    const subject = `✅ Hotel Booking Confirmed: ${hotelName}`;
    const text = [
      `Hello ${user.name || 'Traveler'},`,
      '',
      `Your luxury accommodation booking is confirmed!`,
      '',
      `Hotel: ${hotelName}`,
      `Location: ${hotelLocation}`,
      `Check-in: ${new Date(checkInDate).toLocaleDateString()}`,
      `Check-out: ${new Date(checkOutDate).toLocaleDateString()}`,
      `Duration: ${duration} night(s)`,
      `Price: ${price} per night`,
      '',
      `For assistance, contact us at ${process.env.SUPPORT_EMAIL || 'support@incredibleindia.com'}`,
      `Phone: +91-8106654974`,
    ].join('\n');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject,
      text,
    });

    console.log(`Hotel booking confirmation sent to ${user.email}`);
    res.status(200).json({ message: 'Hotel booked successfully and confirmation email sent' });
  } catch (e) {
    console.error('Hotel booking error:', e);
    res.status(500).json({ message: 'Failed to book hotel' });
  }
});

module.exports = router;


