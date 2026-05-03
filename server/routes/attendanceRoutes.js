const express = require('express');
const router = express.Router();
const { getAttendanceStats, getFacultySetup, getStudentsForAttendance, submitBulkAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getAttendanceStats);
router.get('/faculty-setup', protect, getFacultySetup);
router.get('/students', protect, getStudentsForAttendance);
router.post('/bulk', protect, submitBulkAttendance);

module.exports = router;
