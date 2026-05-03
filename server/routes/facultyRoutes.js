const express = require('express');
const router = express.Router();
const { onboardFaculty, getFaculties, updateFaculty, deleteFaculty, resendWelcomeEmail } = require('../controllers/facultyController');
const { getPerformanceAnalytics } = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/performance', protect, getPerformanceAnalytics);

router.route('/')
    .post(protect, onboardFaculty)
    .get(protect, getFaculties);

router.route('/:id')
    .put(protect, updateFaculty)
    .delete(protect, deleteFaculty);

router.post('/resend-welcome/:id', protect, resendWelcomeEmail);

module.exports = router;
