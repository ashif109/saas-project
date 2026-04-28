const express = require('express');
const router = express.Router();
const { createAcademicYear, getAcademicYears } = require('../controllers/academicController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createAcademicYear)
  .get(protect, getAcademicYears);

module.exports = router;
