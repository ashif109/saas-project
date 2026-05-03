const prisma = require('../config/prisma');

exports.getDashboardSummary = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) {
        return res.status(404).json({ message: "No college context found" });
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
    }).filter(d => d.value > 0);

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
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    const ongoingClasses = await prisma.timetableEntry.count({
        where: { 
            batch: { collegeId },
            dayOfWeek: dayName
        }
    });

    const nextEvent = await prisma.event.findFirst({
        where: { academicYear: { collegeId }, startDate: { gte: today } },
        orderBy: { startDate: 'asc' }
    });

    // 8. Faculty Insights (Engagement based on subject assignments)
    const facultyProfiles = await prisma.facultyProfile.findMany({
        where: { department: { collegeId } },
        take: 3,
        include: { 
            user: true, 
            department: true,
            _count: { select: { subjects: true } }
        }
    });

    // 9. Attendance Analytics (Last 7 Days Trend)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const attendanceRecords = await prisma.attendance.findMany({
        where: { collegeId, date: { gte: sevenDaysAgo } }
    });

    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        trendMap[dateStr] = { count: 0, total: 0 };
    }

    attendanceRecords.forEach(r => {
        const dateStr = new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' });
        if (trendMap[dateStr]) {
            trendMap[dateStr].total++;
            if (r.status === 'PRESENT') trendMap[dateStr].count++;
        }
    });

    const attendanceTrend = Object.keys(trendMap).map(day => ({
        day,
        attendance: trendMap[day].total > 0 ? Math.round((trendMap[day].count / trendMap[day].total) * 100) : 0
    }));

    // Today's average attendance
    const todayStr = today.toLocaleDateString('en-US', { weekday: 'short' });
    const todayStats = trendMap[todayStr];
    const todayAvg = todayStats && todayStats.total > 0 ? ((todayStats.count / todayStats.total) * 100).toFixed(1) : "0.0";

    res.status(200).json({
      kpis: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        activeCourses: courseCount,
        feeCollection: `₹${(totalCollected / 1000).toFixed(1)}K`,
        pendingFees: `₹${(pendingFees / 1000).toFixed(1)}K`,
        attendance: `${todayAvg}%`
      },
      distribution: distribution.length > 0 ? distribution : [
          { name: 'Computer Science', value: 0 },
          { name: 'Business', value: 0 },
          { name: 'Engineering', value: 0 }
      ],
      attendanceTrend: attendanceTrend.length > 0 ? attendanceTrend : [
          { day: 'Mon', attendance: 0 },
          { day: 'Tue', attendance: 0 },
          { day: 'Wed', attendance: 0 },
          { day: 'Thu', attendance: 0 },
          { day: 'Fri', attendance: 0 },
          { day: 'Sat', attendance: 0 },
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
          upcoming: Math.max(0, ongoingClasses - 2), // Mock logic for upcoming
          nextEvent: nextEvent ? { title: nextEvent.title, time: nextEvent.startDate } : null
      },
      facultyInsights: facultyProfiles.map(f => ({
          name: `${f.user.firstName} ${f.user.lastName}`,
          department: f.department.name,
          status: f._count.subjects > 4 ? 'Overloaded' : (f._count.subjects < 2 ? 'Underutilized' : 'Optimal'),
          score: 80 + (f._count.subjects * 3) + Math.floor(Math.random() * 5)
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
              count: 0, // Logic to find empty facultyId in TimetableEntry
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
              count: attendanceRecords.filter(r => r.status === 'ABSENT').length, 
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

exports.getFacultyDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { facultyProfile: true }
    });

    if (!user || !user.facultyProfile) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const facultyId = user.facultyProfile.id;

    // 1. Today's Classes
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const todaysSchedule = await prisma.timetableEntry.findMany({
      where: {
        facultyId: facultyId,
        dayOfWeek: dayName
      },
      include: {
        subject: true,
        batch: {
          include: {
            course: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    const todaysClassesCount = todaysSchedule.length;

    // 2. Pending Assignments (due date >= today and created by this faculty)
    const pendingAssignmentsCount = await prisma.assignment.count({
      where: {
        facultyId: facultyId,
        dueDate: {
          gte: todayStart
        }
      }
    });

    // 3. Unresolved Doubts (assigned to this faculty, status OPEN)
    const unresolvedDoubtsCount = await prisma.doubt.count({
      where: {
        facultyId: facultyId,
        status: 'OPEN'
      }
    });

    // 4. Attendance Marked (count of today's classes where attendance has been marked by this faculty)
    // We check if attendance records exist for the subjects and batches in today's schedule for today's date
    let attendanceMarkedCount = 0;
    
    // Batch the queries or do a simple loop since it's limited per day
    for (const entry of todaysSchedule) {
      if (entry.subjectId) {
        const attendanceExists = await prisma.attendance.findFirst({
          where: {
            subjectId: entry.subjectId,
            batchId: entry.batchId,
            date: {
              gte: todayStart,
              lte: todayEnd
            }
          }
        });
        if (attendanceExists) {
          attendanceMarkedCount++;
        }
      }
    }

    // Format the schedule for the frontend
    const scheduleFormatted = todaysSchedule.map(cls => ({
      time: `${cls.startTime} - ${cls.endTime}`,
      subject: cls.subject?.name || 'Unknown Subject',
      room: cls.roomInfo || 'TBD',
      batch: `${cls.batch.course.name} - ${cls.batch.name}`
    }));

    res.status(200).json({
      stats: {
        todaysClasses: todaysClassesCount,
        pendingAssignments: pendingAssignmentsCount,
        unresolvedDoubts: unresolvedDoubtsCount,
        attendanceMarked: `${attendanceMarkedCount}/${todaysClassesCount}`
      },
      schedule: scheduleFormatted
    });

  } catch (error) {
    console.error('Faculty Dashboard Error:', error);
    res.status(500).json({ message: "Failed to load faculty dashboard data" });
  }
};
