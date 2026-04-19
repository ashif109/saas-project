const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// Authenticate user & attach roles
const protectPrisma = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error(`Not authorized: ${error.message}`);
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// The Advanced Role Engine Middleware
// Checks if the user has any of the requested permissions globally OR in their scoped roles
const requirePermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.userRoles) {
      res.status(403);
      throw new Error('Not authorized, missing roles context');
    }

    const hasSuperAdmin = req.user.isSuperAdmin;
    if (hasSuperAdmin) return next();

    let hasPermission = false;
    for (const ur of req.user.userRoles) {
      // Check time-bound validity
      if (ur.validFrom && ur.validFrom > new Date()) continue;
      if (ur.validUntil && ur.validUntil < new Date()) continue;

      // Extract raw permissions config for role + overrides
      const combinedPermissions = [...(ur.role.permissions || []), ...(ur.extraPermissions || [])];
      
      if (combinedPermissions.includes(requiredPermission) || combinedPermissions.includes('ALL')) {
        // Here we could implement scoped logic (e.g. if the action is on Dept X, check if ur.departmentId is X)
        // For now, if they have the permission globally or for their scoped role, we allow access. 
        // More granular checking would be inside the Controller if needed.
        hasPermission = true;
        break;
      }
    }

    if (!hasPermission) {
      res.status(403);
      throw new Error(`Forbidden: You need '${requiredPermission}' permission`);
    }

    next();
  });
};

module.exports = { protectPrisma, requirePermission };
