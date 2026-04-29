const express = require('express');
const router = express.Router();
const { getInstitutionalReports } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/institutional', protect, getInstitutionalReports);

module.exports = router;
