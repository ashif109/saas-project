const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitMarks, submitBulkMarks, getMarks } = require('../controllers/marksController');

router.route('/')
    .post(protect, authorize('FACULTY', 'ADMIN', 'SUPER_ADMIN'), submitMarks)
    .get(protect, getMarks);

router.post('/bulk', protect, authorize('FACULTY', 'ADMIN', 'SUPER_ADMIN'), submitBulkMarks);

module.exports = router;
