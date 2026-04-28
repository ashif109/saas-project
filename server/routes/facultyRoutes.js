const express = require('express');
const router = express.Router();
const { onboardFaculty, getFaculties } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, onboardFaculty)
  .get(protect, getFaculties);

module.exports = router;
