const express = require('express');
const router = express.Router();
const { 
  createDepartment, 
  getDepartments, 
  updateDepartment, 
  deleteDepartment 
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createDepartment)
  .get(protect, getDepartments);

router.route('/:id')
  .put(protect, updateDepartment)
  .delete(protect, deleteDepartment);

module.exports = router;
