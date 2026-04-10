const express = require('express');
const router = express.Router();
const { getSystemStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Analytics routes
router.get('/system-stats', protect, authorize('SUPER_ADMIN'), getSystemStats);

module.exports = router;
