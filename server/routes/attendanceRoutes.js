const express = require('express');
const router = express.Router();
const { getAttendanceStats } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getAttendanceStats);

module.exports = router;
