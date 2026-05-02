const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { applyLeave, getMyLeaves } = require('../controllers/leaveController');

router.route('/')
    .post(protect, authorize('FACULTY'), applyLeave);

router.route('/my-leaves')
    .get(protect, authorize('FACULTY'), getMyLeaves);

module.exports = router;
