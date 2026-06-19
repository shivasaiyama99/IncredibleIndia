const TripPlan = require('../models/tripPlan');

// Helper for sending alert email (wired in routes with a mailer util)
let sendSafetyAlertEmail = async () => {};
exports._setMailer = (fn) => {
  sendSafetyAlertEmail = fn;
};

// --- Save a new trip plan (status=planned) ---
exports.saveTripPlan = async (req, res) => {
  try {
    const {
      destination,
      duration,
      numberOfPeople,
      budget = '',
      tripType = 'cultural',
      itineraryText = '',
      safetyMonitoring = false,
      trustedContactEmail = '',
      monitoringIntervalMinutes = 2,
      monitoringTimeoutMinutes = 5,
      startDate,
      endDate,
    } = req.body;

    if (!destination || !numberOfPeople) {
      return res.status(400).json({ message: 'destination and numberOfPeople are required' });
    }
    // Validate dates
    const today = new Date(); today.setHours(0,0,0,0);
    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;
    if (!sDate || !eDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }
    const startMid = new Date(sDate); startMid.setHours(0,0,0,0);
    const endMid = new Date(eDate); endMid.setHours(0,0,0,0);
    if (startMid < today) {
      return res.status(400).json({ message: 'startDate cannot be in the past' });
    }
    if (endMid < startMid) {
      return res.status(400).json({ message: 'endDate must be >= startDate' });
    }
    const diffDays = Math.ceil((endMid.getTime() - startMid.getTime()) / (24*60*60*1000));
    if (diffDays > 21) {
      return res.status(400).json({ message: 'Trip length cannot exceed 21 days' });
    }

    const newTripPlan = new TripPlan({
      user: req.user.id,
      destination,
      numberOfPeople,
      budget,
      tripType,
      itineraryText,
      status: 'planned',
      safetyMonitoring,
      trustedContactEmail,
      monitoringEnabled: safetyMonitoring,
      monitoringIntervalMinutes,
      monitoringTimeoutMinutes,
      lastSafetyCheck: null,
      startDate: startMid,
      endDate: endMid,
    });

    await newTripPlan.save();
    res.status(201).json({ message: 'Trip plan saved successfully!', tripPlan: newTripPlan });
  } catch (error) {
    console.error('SAVE TRIP PLAN ERROR:', error);
    res.status(500).json({ message: 'Server error while saving trip plan.' });
  }
};

// --- Book a trip plan (status=booked) ---
exports.bookTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await TripPlan.findOne({ _id: id, user: req.user.id });
    if (!plan) return res.status(404).json({ message: 'Trip plan not found' });
    plan.status = 'booked';
    // Enable monitoring upon booking if enabled; actual prompts respect date range in frontend
    if (plan.safetyMonitoring) {
      plan.monitoringEnabled = true;
    }
    await plan.save();
    res.json({ message: 'Trip booked successfully', tripPlan: plan });
  } catch (error) {
    console.error('BOOK TRIP ERROR:', error);
    res.status(500).json({ message: 'Server error while booking trip.' });
  }
};

// --- Respond to safety prompt ---
exports.respondSafety = async (req, res) => {
  try {
    const { id } = req.params; // plan id
    const { response } = req.body; // 'yes' | 'no'
    const plan = await TripPlan.findOne({ _id: id, user: req.user.id });
    if (!plan) return res.status(404).json({ message: 'Trip plan not found' });
    if (!plan.safetyMonitoring || !plan.monitoringEnabled) {
      return res.status(400).json({ message: 'Safety monitoring not enabled for this trip' });
    }

    if (response === 'yes') {
      plan.status = 'safe';
      plan.lastSafetyCheck = new Date();
      await plan.save();
      return res.json({ message: 'Status updated to safe', tripPlan: plan });
    } else if (response === 'no') {
      plan.status = 'not_safe';
      plan.lastSafetyCheck = new Date();
      await plan.save();
      if (plan.trustedContactEmail) {
        try {
          await sendSafetyAlertEmail(plan, 'User reported NOT SAFE');
        } catch (e) {
          console.error('EMAIL SEND ERROR:', e);
        }
      }
      return res.json({ message: 'Status updated to not_safe and alert sent', tripPlan: plan });
    }

    return res.status(400).json({ message: 'Invalid response. Use yes/no' });
  } catch (error) {
    console.error('RESPOND SAFETY ERROR:', error);
    res.status(500).json({ message: 'Server error while updating safety status.' });
  }
};

// Alternate safety endpoint using body: { planId, response }
exports.safetyCheck = async (req, res) => {
  try {
    const { planId, response } = req.body;
    req.params.id = planId;
    return exports.respondSafety(req, res);
  } catch (e) {
    console.error('SAFETY CHECK ERROR:', e);
    res.status(500).json({ message: 'Server error while processing safety check.' });
  }
};

// --- List trips by status for current user ---
exports.listByStatus = async (req, res) => {
  try {
    const { status } = req.query; // 'planned' | 'booked' | 'safe' | 'not_safe'
    const query = { user: req.user.id };
    if (status) query.status = status;
    const plans = await TripPlan.find(query).sort({ createdAt: -1 });
    res.json({ tripPlans: plans });
  } catch (error) {
    console.error('LIST TRIPS ERROR:', error);
    res.status(500).json({ message: 'Server error while listing trips.' });
  }
};

// --- Public util used by scheduler to auto-alert on timeout ---
exports._autoAlertIfOverdue = async (now = new Date()) => {
  const overduePlans = await TripPlan.find({
    monitoringEnabled: true,
    safetyMonitoring: true,
    trustedContactEmail: { $ne: '' },
    status: { $in: ['booked', 'safe'] },
  });

  for (const plan of overduePlans) {
    // Only within trip window
    const nowMs = now.getTime();
    const startMs = plan.startDate ? new Date(plan.startDate).getTime() : -Infinity;
    const endMs = plan.endDate ? new Date(plan.endDate).getTime() : Infinity;
    if (!(nowMs >= startMs && nowMs <= endMs)) {
      continue;
    }
    const last = plan.lastSafetyCheck ? new Date(plan.lastSafetyCheck).getTime() : 0;
    const minutesSince = last ? Math.floor((now.getTime() - last) / 60000) : Infinity;
    if (minutesSince >= plan.monitoringTimeoutMinutes) {
      plan.status = 'not_safe';
      plan.lastSafetyCheck = now;
      await plan.save();
      try {
        await sendSafetyAlertEmail(plan, 'No response within timeout window');
      } catch (e) {
        console.error('EMAIL SEND ERROR:', e);
      }
    }
  }
};
