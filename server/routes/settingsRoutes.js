const express = require('express');
const router = express.Router();
const { getSystemSettings, updateSystemSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// System settings routes
router.route('/system')
  .get(protect, authorize('SUPER_ADMIN'), getSystemSettings)
  .put(protect, authorize('SUPER_ADMIN'), updateSystemSettings);

module.exports = router;
