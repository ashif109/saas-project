const express = require('express');
const router = express.Router();
const { createNotice, getNotices, deleteNotice } = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createNotice)
  .get(protect, getNotices);

router.delete('/:id', protect, deleteNotice);

module.exports = router;
