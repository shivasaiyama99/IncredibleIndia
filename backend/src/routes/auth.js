const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authcontroller');

// This creates the endpoint: POST /api/auth/signup
// When a request hits this URL, it will run the 'signup' function.
router.post('/signup', signup);

// This creates the endpoint: POST /api/auth/login
// When a request hits this URL, it will run the 'login' function.
router.post('/login', login);

module.exports = router;