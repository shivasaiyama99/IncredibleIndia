const express = require('express');
const router = express.Router();
const { createChatCompletion } = require('../controllers/chatController');

// Simple public endpoint. If you want to protect it, import auth middleware and use router.use(auth)
router.post('/', createChatCompletion);

module.exports = router;


