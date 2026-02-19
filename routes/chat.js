const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');

// Single route for chatbot
router.post('/', chatController.handleMessage);

module.exports = router;