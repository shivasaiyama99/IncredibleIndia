const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  saveTripPlan,
  bookTrip,
  respondSafety,
  listByStatus,
  _setMailer,
  safetyCheck,
} = require('../controllers/tripPlanController');

// Nodemailer setup
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendSafetyAlertEmail(plan, reason) {
  const to = plan.trustedContactEmail;
  if (!to) return;
  const subject = `Safety Alert for ${plan.destination}`;
  const text = `Alert reason: ${reason}\n\nUser may need assistance on trip to ${plan.destination}.\n\nDetails:\n- Travelers: ${plan.numberOfPeople}\n- Last safety check: ${plan.lastSafetyCheck}\n- Status: ${plan.status}`;
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

// Injection for controller to use mailer
_setMailer(sendSafetyAlertEmail);

// Routes
router.post('/', auth, saveTripPlan); // create (planned)
router.post('/:id/book', auth, bookTrip); // set booked
router.post('/:id/safety', auth, respondSafety); // respond yes/no
router.post('/safety-check', auth, safetyCheck); // respond using body {planId,response}
router.get('/', auth, listByStatus); // list by optional status query

module.exports = router;
