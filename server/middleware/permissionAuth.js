const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to strictly check action permissions based on the hierarchical role assignments.
 * 
 * Supports two modes:
 * - Scoped Mode (requires req.params.departmentId or similar to ensure user is HOD of THAT dept).
 * - Global Mode (handles Director/Admin scenarios).
 */
const requirePermission = (requiredAction) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Appended by verifyToken middleware

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized. No user token provided.' });
      }

      // 1. FAST PATH: Super Admins bypass all role logic
      if (user.role === 'SUPER_ADMIN') {
        return next();
      }

      // 2. We need to query their UserRole array, joining the Role table to get string[] permissions.
      // Eagerly fetching this could be cached in Redis in a real prod environment.
      const userRoles = await prisma.userRole.findMany({
        where: { 
          userId: user.id,
          // Handle validUntil time-bounded logic
          OR: [
            { validUntil: null },
            { validUntil: { gt: new Date() } }
          ]
        },
        include: { role: true }
      });

      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({ message: 'No active roles assigned.' });
      }

      let hasPermission = false;
      let allowedGlobal = false;
      let allowedDepartments = new Set();
      
      // 3. MERGE ALL PERMISSIONS across all assigned multi-roles
      for (const ur of userRoles) {
        // Collect extra permissions given individually to the user
        const mergedPerms = new Set([...ur.role.permissions, ...ur.extraPermissions]);
        
        if (mergedPerms.has(requiredAction) || mergedPerms.has('ALL')) {
          hasPermission = true;
          
          if (ur.role.isGlobal || !ur.departmentId) {
            allowedGlobal = true;
          } else {
            allowedDepartments.add(ur.departmentId);
          }
        }
      }

      if (!hasPermission) {
        // Attempt a quiet log to AuditLog of failed attempts
        return res.status(403).json({ message: `Forbidden. Missing permission: ${requiredAction}` });
      }

      // 4. SMART SCOPING (HOD logic vs Director logic)
      if (!allowedGlobal && allowedDepartments.size > 0) {
        // If the request is trying to mutate a specific department, 
        // they MUST have permission scoped to that specific department.
        const targetDepartmentId = req.body.departmentId || req.query.departmentId || req.params.departmentId;
        
        if (targetDepartmentId && !allowedDepartments.has(targetDepartmentId)) {
          return res.status(403).json({ 
            message: `Forbidden. You only have access to perform this action in your assigned departments.`,
            allowedDepartments: Array.from(allowedDepartments)
          });
        }
      }
      
      // Inject merged scoping into request context for downstream controllers to use in Prisma `where` clauses
      req.scope = {
        isGlobal: allowedGlobal,
        allowedDepartments: Array.from(allowedDepartments)
      };

      next();

    } catch (error) {
      console.error('Permission Auth Middleware Error:', error);
      res.status(500).json({ message: 'Internal Server Error enforcing permissions.' });
    }
  };
};

module.exports = {
  requirePermission
};
