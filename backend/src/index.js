const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import all the route handlers
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlist');
const tripPlanRoutes = require('./routes/tripPlan');
const chatRoutes = require('./routes/chat');
const bookingRoutes = require('./routes/booking');
const plansRoutes = require('./routes/plans');
const safetyRoutes = require('./routes/safety');
// Guide feature routers
const guideRoutes = require('../guide/routes/guide');
const guideBookingRoutes = require('../guide/routes/booking');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request Logger Middleware (with fix for OPTIONS requests)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Received ${req.method} request for ${req.url}`);
  
  // Check if req.body exists before trying to access its keys
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  }
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes - Tell the server which router to use for which URL path
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/tripplans', tripPlanRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/safety', safetyRoutes);
// Mount guide feature under /api/guide to avoid conflicts
app.use('/api/guide', guideRoutes);
app.use('/api/guide', guideBookingRoutes);

// Test route to confirm the server is running
app.get('/', (req, res) => {
  res.send('Incredible India API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  // Simple in-memory scheduler for safety monitoring (demo intervals)
  try {
    const { _autoAlertIfOverdue } = require('./controllers/tripPlanController');
    // Check every minute; use short demo windows configured per plan
    setInterval(async () => {
      try {
        await _autoAlertIfOverdue(new Date());
      } catch (e) {
        console.error('Scheduler error:', e);
      }
    }, 60 * 1000);
    console.log('⏱️ Safety monitoring scheduler started (checks every 60s).');
  } catch (e) {
    console.error('Failed to start scheduler:', e);
  }
});

module.exports = app;

