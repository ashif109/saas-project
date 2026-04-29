const express = require('express');
const router = express.Router();
const { 
    createScholarship, 
    getScholarships, 
    updateScholarship, 
    deleteScholarship,
    applyForScholarship,
    getApplications,
    updateApplicationStatus
} = require('../controllers/scholarshipController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createScholarship)
    .get(protect, getScholarships);

router.route('/:id')
    .put(protect, updateScholarship)
    .delete(protect, deleteScholarship);

router.post('/apply', protect, applyForScholarship);

router.get('/:scholarshipId/applications', protect, getApplications);

router.put('/applications/:id', protect, updateApplicationStatus);

module.exports = router;
