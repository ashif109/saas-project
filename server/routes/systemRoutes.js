const express = require('express');
const router = express.Router();
const { 
  syncPlatformData, 
  clearTempData, 
  recalculateAnalytics, 
  restartPlatform 
} = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Maintenance routes
router.post('/sync-data', protect, authorize('SUPER_ADMIN'), syncPlatformData);
router.post('/clear-temp-data', protect, authorize('SUPER_ADMIN'), clearTempData);
router.post('/recalculate-analytics', protect, authorize('SUPER_ADMIN'), recalculateAnalytics);
router.post('/restart', protect, authorize('SUPER_ADMIN'), restartPlatform);

module.exports = router;
