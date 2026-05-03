const prisma = require('../config/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Get performance analytics for a batch and subject
// @route   GET /api/faculty/performance
// @access  Private (Faculty)
const getPerformanceAnalytics = asyncHandler(async (req, res) => {
    const { batchId, subjectId } = req.query;

    if (!batchId || !subjectId) {
        res.status(400);
        throw new Error('Batch ID and Subject ID are required');
    }

    // 1. Get all students in the batch
    const students = await prisma.studentProfile.findMany({
        where: { batchId },
        include: {
            user: { select: { firstName: true, lastName: true } },
            attendances: { where: { subjectId } },
            internalMarks: { where: { subjectId } }
        }
    });

    // 2. Calculate Analytics
    let totalAttendancePercent = 0;
    let totalMarksPercent = 0;
    let studentCount = students.length;
    let attendanceDefaulters = 0;
    let academicWarnings = 0;

    const studentRoster = students.map(student => {
        // Attendance calculation
        const totalClasses = student.attendances.length;
        const presentClasses = student.attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const attendancePercent = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
        
        // Marks calculation
        const totalMaxMarks = student.internalMarks.reduce((sum, m) => sum + m.maxMarks, 0);
        const totalObtainedMarks = student.internalMarks.reduce((sum, m) => sum + m.marksObtained, 0);
        const marksPercent = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;

        totalAttendancePercent += attendancePercent;
        totalMarksPercent += marksPercent;

        let status = 'Excellent';
        if (attendancePercent < 75) {
            status = 'At Risk (Attendance)';
            attendanceDefaulters++;
        } else if (marksPercent < 50) {
            status = 'At Risk (Marks)';
            academicWarnings++;
        } else if (attendancePercent < 80 || marksPercent < 60) {
            status = 'Warning';
        } else if (attendancePercent >= 90 && marksPercent >= 85) {
            status = 'Excellent';
        } else {
            status = 'Good';
        }

        return {
            id: student.id,
            name: `${student.user.firstName} ${student.user.lastName}`,
            enrollment: student.enrollmentNo,
            attendance: Math.round(attendancePercent),
            marksAvg: Math.round(marksPercent),
            status
        };
    });

    const avgAttendance = studentCount > 0 ? Math.round(totalAttendancePercent / studentCount) : 0;
    const avgMarks = studentCount > 0 ? Math.round(totalMarksPercent / studentCount) : 0;

    res.status(200).json({
        summary: {
            avgAttendance,
            avgMarks,
            attendanceDefaulters,
            academicWarnings
        },
        roster: studentRoster
    });
});

module.exports = { getPerformanceAnalytics };
