const express = require('express');
const router = express.Router();
const { getLogs, clearLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('SUPER_ADMIN'), getLogs)
  .delete(protect, authorize('SUPER_ADMIN'), clearLogs);

module.exports = router;