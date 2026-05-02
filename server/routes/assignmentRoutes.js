const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createAssignment, getAssignments, gradeSubmission } = require('../controllers/assignmentController');

router.route('/')
    .post(protect, authorize('FACULTY', 'ADMIN', 'SUPER_ADMIN'), createAssignment)
    .get(protect, getAssignments);

router.route('/submissions/:id/grade')
    .put(protect, authorize('FACULTY', 'ADMIN', 'SUPER_ADMIN'), gradeSubmission);

module.exports = router;
