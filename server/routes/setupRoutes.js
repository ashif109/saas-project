const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const batchController = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');

// Course Routes
router.route('/courses')
  .post(protect, courseController.createCourse)
  .get(protect, courseController.getCourses);

router.route('/courses/:id')
  .put(protect, courseController.updateCourse)
  .delete(protect, courseController.deleteCourse);

// Batch Routes
router.route('/batches')
  .post(protect, batchController.createBatch)
  .get(protect, batchController.getBatches);

router.route('/batches/:id')
  .put(protect, batchController.updateBatch)
  .delete(protect, batchController.deleteBatch);

module.exports = router;
