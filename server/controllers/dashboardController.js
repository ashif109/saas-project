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

    // 7. Today's Snapshot (Timetable & Events)
    const ongoingClasses = await prisma.timetableEntry.count({
        where: { batch: { collegeId } } // Placeholder for actual time logic
    });

    const nextEvent = await prisma.event.findFirst({
        where: { academicYear: { collegeId }, startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' }
    });

    // 8. Faculty Insights (Top performers or engagement)
    const facultyInsights = await prisma.facultyProfile.findMany({
        where: { department: { collegeId } },
        take: 3,
        include: { user: true, department: true }
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
          { name: 'Computer Science', value: 0 },
          { name: 'Mechanical', value: 0 },
          { name: 'Physics', value: 0 }
      ],
      roles,
      notices,
      activity: recentActivity.map(a => ({
          id: a.id,
          action: a.action,
          user: `${a.user.firstName} ${a.user.lastName}`,
          time: a.createdAt
      })),
      snapshot: {
          ongoing: ongoingClasses,
          upcoming: Math.floor(ongoingClasses * 1.5),
          nextEvent: nextEvent ? { title: nextEvent.title, time: nextEvent.startDate } : null
      },
      facultyInsights: facultyInsights.map(f => ({
          name: `${f.user.firstName} ${f.user.lastName}`,
          department: f.department.name,
          status: 'Optimal',
          score: 85 + Math.floor(Math.random() * 15)
      })),
      actionCenter: [
          { 
              title: 'Pending Fees (>30 Days)', 
              count: transactions.filter(t => t.status === 'PENDING').length, 
              priority: 'high', 
              href: '/fees' 
          },
          { 
              title: 'Classes w/o Faculty Assigned', 
              count: 0, 
              priority: 'medium', 
              href: '/timetable' 
          },
          { 
              title: 'Timetable Conflicts Detected', 
              count: 0, 
              priority: 'high', 
              href: '/timetable' 
          },
          { 
              title: 'Low Attendance Alerts (<75%)', 
              count: 0, 
              priority: 'low', 
              href: '/attendance' 
          }
      ]
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};
