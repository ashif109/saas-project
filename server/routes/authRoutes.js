const express = require('express');
const router = express.Router();
const {
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  impersonateUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/impersonate/:userId', protect, authorize('SUPER_ADMIN'), impersonateUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
