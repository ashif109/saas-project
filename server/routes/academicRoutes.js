const express = require('express');
const router = express.Router();
const { createAcademicYear, getAcademicYears, updateAcademicYear, deleteAcademicYear } = require('../controllers/academicController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createAcademicYear)
  .get(protect, getAcademicYears);

router.route('/:id')
  .put(protect, updateAcademicYear)
  .delete(protect, deleteAcademicYear);

module.exports = router;
