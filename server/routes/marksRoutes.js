const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitMarks, getMarks } = require('../controllers/marksController');

router.route('/')
    .post(protect, authorize('FACULTY', 'ADMIN', 'SUPER_ADMIN'), submitMarks)
    .get(protect, getMarks);

module.exports = router;
