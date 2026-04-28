const express = require('express');
const router = express.Router();
const { onboardFaculty, getFaculties, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, onboardFaculty)
  .get(protect, getFaculties);

router.route('/:id')
  .put(protect, updateFaculty)
  .delete(protect, deleteFaculty);

module.exports = router;
