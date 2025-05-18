const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// Register route
router.post('/signup', userController.registerUser);

// Login route
router.post('/login', userController.loginUser);

// Fetch user details route
router.get('/profile/:userId', userController.getUserDetails);

// Reset Password Route
router.post('/reset-password', userController.resetPassword);

module.exports = router;