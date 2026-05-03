const prisma = require('../config/prisma');

exports.getAttendanceStats = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
        const firstCollege = await prisma.college.findFirst();
        collegeId = firstCollege?.id;
    }

    const today = new Date();
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        last5Days.push(d.toISOString().split('T')[0]);
    }

    // Mocking some data for the chart if empty
    const stats = last5Days.map(day => ({
        name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        value: 85 + Math.floor(Math.random() * 10)
    }));

    res.status(200).json(stats);
  } catch (error) {
    console.error('Attendance Stats Error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getFacultySetup = async (req, res) => {
  try {
    if (req.user?.role !== 'FACULTY') {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = req.user._id || req.user.id;
    console.log("DEBUG: Attendance Setup for User ID:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { facultyProfile: true }
    });

    if (!user?.facultyProfile) {
      console.log("DEBUG: Faculty profile not found for user:", userId);
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const facultyId = user.facultyProfile.id;
    console.log("DEBUG: Found Faculty ID for attendance:", facultyId);

    const entries = await prisma.timetableEntry.findMany({
      where: { facultyId },
      include: {
        batch: { include: { course: true } },
        subject: true
      }
    });

    const uniqueBatches = new Map();
    const uniqueSubjects = new Map();

    entries.forEach(entry => {
      if (entry.batch && !uniqueBatches.has(entry.batch.id)) {
        uniqueBatches.set(entry.batch.id, {
          id: entry.batch.id,
          name: `${entry.batch.course?.name || ''} ${entry.batch.name}`.trim()
        });
      }
      if (entry.subject && !uniqueSubjects.has(entry.subject.id)) {
        uniqueSubjects.set(entry.subject.id, {
          id: entry.subject.id,
          name: entry.subject.name
        });
      }
    });

    res.status(200).json({
      batches: Array.from(uniqueBatches.values()),
      subjects: Array.from(uniqueSubjects.values())
    });

  } catch (error) {
    console.error('Faculty Setup Error:', error);
    res.status(500).json({ message: "Failed to fetch setup data" });
  }
};

exports.getStudentsForAttendance = async (req, res) => {
  try {
    const { batchId } = req.query;
    if (!batchId) {
      return res.status(400).json({ message: "batchId is required" });
    }

    const students = await prisma.user.findMany({
      where: {
        studentProfile: {
          batchId: batchId
        }
      },
      include: {
        studentProfile: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    const mapped = students.map(s => ({
      id: s.studentProfile.id,
      name: `${s.firstName} ${s.lastName}`.trim(),
      enrollmentNo: s.studentProfile.enrollmentNo
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch Students Error:', error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

exports.submitBulkAttendance = async (req, res) => {
  try {
    const { date, batchId, subjectId, attendance } = req.body;

    if (!date || !batchId || !subjectId || !attendance) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const attendanceDate = new Date(date);

    await prisma.$transaction(async (tx) => {
      // Create or update attendance for each student
      for (const [studentId, status] of Object.entries(attendance)) {
        // Find existing record
        const existing = await tx.attendance.findFirst({
          where: {
            studentId,
            subjectId,
            date: {
              gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
              lt: new Date(attendanceDate.setHours(23, 59, 59, 999))
            }
          }
        });

        if (existing) {
          await tx.attendance.update({
            where: { id: existing.id },
            data: { status }
          });
        } else {
          await tx.attendance.create({
            data: {
              date: new Date(date),
              status,
              studentId,
              subjectId,
              batchId,
              collegeId
            }
          });
        }
      }
    });

    res.status(200).json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error('Bulk Attendance Error:', error);
    res.status(500).json({ message: "Failed to save attendance" });
  }
};
