const express = require('express');
const router = express.Router();
const { getDashboardSummary, getFacultyDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/faculty-summary', protect, getFacultyDashboardSummary);

module.exports = router;
