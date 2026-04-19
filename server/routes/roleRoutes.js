const express = require('express');
const router = express.Router();
const { assignRole, getUserRoles, createRole, getCollegeRoles } = require('../controllers/roleController');
const { protectPrisma, requirePermission } = require('../middleware/roleAuth');

router.use(protectPrisma); // Enforce auth

// Role definitions
router.post('/', requirePermission('SUPER_ADMIN'), createRole);
router.get('/college/:collegeId', requirePermission('VIEW_ROLES'), getCollegeRoles);

// Role Assignment Matrix
router.post('/assign', requirePermission('ASSIGN_ROLE'), assignRole);
router.get('/user/:userId', requirePermission('VIEW_ROLES'), getUserRoles);

module.exports = router;
