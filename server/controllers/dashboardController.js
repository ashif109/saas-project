const prisma = require('../config/prisma');

exports.getDashboardSummary = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    // 1. Basic KPI Counts
    const [studentCount, facultyCount, courseCount] = await Promise.all([
      prisma.studentProfile.count({ where: { user: { collegeId } } }),
      prisma.facultyProfile.count({ where: { user: { collegeId } } }),
      prisma.course.count({ where: { department: { collegeId } } })
    ]);

    // 2. Financial Stats
    const transactions = await prisma.transaction.findMany({
      where: { collegeId }
    });
    
    const totalCollected = transactions
        .filter(t => t.status === 'PAID')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingFees = transactions
        .filter(t => t.status === 'PENDING')
        .reduce((sum, t) => sum + t.amount, 0);

    // 3. Student Distribution by Department
    const departments = await prisma.department.findMany({
      where: { collegeId },
      include: {
        _count: {
            select: { courses: { where: { batches: { some: { students: { some: {} } } } } } }
        },
        courses: {
            include: {
                batches: {
                    include: {
                        _count: { select: { students: true } }
                    }
                }
            }
        }
      }
    });

    const distribution = departments.map(d => {
        let count = 0;
        d.courses.forEach(c => {
            c.batches.forEach(b => {
                count += b._count.students;
            });
        });
        return { name: d.name, value: count };
    });

    // 4. Role Distribution
    const roleCounts = await prisma.role.findMany({
        where: { collegeId },
        include: {
            _count: { select: { userRoles: true } }
        }
    });

    const roles = roleCounts.map(r => ({
        name: r.name,
        count: r._count.userRoles
    }));

    // 5. Recent Activity (Audit Logs)
    const recentActivity = await prisma.auditLog.findMany({
        where: { collegeId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    // 6. Recent Notices
    const notices = await prisma.notice.findMany({
        where: { collegeId },
        take: 3,
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      kpis: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        activeCourses: courseCount,
        feeCollection: `₹${(totalCollected / 1000).toFixed(1)}K`,
        pendingFees: `₹${(pendingFees / 1000).toFixed(1)}K`,
        attendance: "89.4%" // Mocked for now
      },
      distribution: distribution.length > 0 ? distribution : [
          { name: 'Computer Science', value: 400 },
          { name: 'Business', value: 300 },
          { name: 'Engineering', value: 300 }
      ],
      roles,
      notices,
      activity: recentActivity.map(a => ({
          id: a.id,
          action: a.action,
          user: `${a.user.firstName} ${a.user.lastName}`,
          time: a.createdAt
      }))
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};
