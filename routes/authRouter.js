const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, admin } = require('../Middleware/authMiddleware');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Admin Only Routes
router.get('/users', authController.getAllUsers);
router.delete('/users/:id', authController.deleteUser);

module.exports = router;