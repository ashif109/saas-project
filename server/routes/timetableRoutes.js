const express = require('express');
const router = express.Router();
const { createTimetableEntry, getTimetable, deleteTimetableEntry, getTimetableMetadata } = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTimetableEntry)
  .get(protect, getTimetable);

router.get('/metadata', protect, getTimetableMetadata);

router.route('/:id')
  .delete(protect, deleteTimetableEntry);

module.exports = router;
