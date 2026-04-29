const prisma = require('../config/prisma');

exports.getAllUsers = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId && req.user?.role !== 'SUPER_ADMIN') {
        const firstCollege = await prisma.college.findFirst();
        collegeId = firstCollege?.id;
    }

    const where = collegeId ? { collegeId } : {};

    const users = await prisma.user.findMany({
      where,
      include: {
        college: true,
        userRoles: {
            include: { role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(users.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.userRoles.length > 0 ? u.userRoles[0].role.name : 'No Role',
        college: u.college?.name || 'System',
        status: 'Active'
    })));
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
