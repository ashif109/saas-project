const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDoubts, replyDoubt } = require('../controllers/doubtController');

router.route('/')
    .get(protect, getDoubts);

router.route('/:id/reply')
    .post(protect, replyDoubt);

module.exports = router;
