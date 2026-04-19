const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Assign roles to a user (Multi-Role Dynamic Access System)
// @route   POST /api/roles/assign
// @access  Private (Needs ASSIGN_ROLE permission)
const assignRole = asyncHandler(async (req, res) => {
  const { userId, roleId, departmentId, isPrimary, extraPermissions, validFrom, validUntil } = req.body;

  // Validate user and role exist
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  const role = await prisma.role.findUnique({ where: { id: roleId } });

  if (!targetUser || !role) {
    res.status(404);
    throw new Error('User or Role not found');
  }

  // Create UserRole (Matrix mapping)
  const userRole = await prisma.userRole.create({
    data: {
      userId,
      roleId,
      departmentId: departmentId || null,
      isPrimary: isPrimary || false,
      extraPermissions: extraPermissions || [],
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
    include: { role: true, department: true }
  });

  res.status(201).json(userRole);
});

// @desc    Get Role Matrix for a user
// @route   GET /api/roles/user/:userId
// @access  Private
const getUserRoles = asyncHandler(async (req, res) => {
  const userRoles = await prisma.userRole.findMany({
    where: { userId: req.params.userId },
    include: {
      role: true,
      department: true
    }
  });

  res.json(userRoles);
});

// @desc    Create a new baseline Role schema (e.g. "HOD")
// @route   POST /api/roles
// @access  Private
const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions, collegeId, isGlobal } = req.body;

  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions,
      collegeId,
      isGlobal
    }
  });

  res.status(201).json(role);
});

// @desc    Fetch all available roles for the college
// @route   GET /api/roles/college/:collegeId
// @access  Private
const getCollegeRoles = asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    where: { collegeId: req.params.collegeId }
  });
  res.json(roles);
});

module.exports = {
  assignRole,
  getUserRoles,
  createRole,
  getCollegeRoles
};
