const prisma = require('../config/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Faculty)
const applyLeave = asyncHandler(async (req, res) => {
    const { startDate, endDate, reason, substituteId } = req.body;

    const faculty = await prisma.facultyProfile.findUnique({
        where: { userId: req.user.id }
    });

    if (!faculty) {
        res.status(403);
        throw new Error('Only faculty can apply for leaves');
    }

    const leave = await prisma.leaveRequest.create({
        data: {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            substituteId: substituteId || null,
            facultyId: faculty.id
        }
    });

    res.status(201).json({ success: true, data: leave });
});

// @desc    Get all leave requests for a faculty
// @route   GET /api/leaves/my-leaves
// @access  Private (Faculty)
const getMyLeaves = asyncHandler(async (req, res) => {
    const faculty = await prisma.facultyProfile.findUnique({
        where: { userId: req.user.id }
    });

    if (!faculty) {
        res.status(403);
        throw new Error('Only faculty can view their leaves');
    }

    const leaves = await prisma.leaveRequest.findMany({
        where: { facultyId: faculty.id },
        include: {
            substitute: { select: { user: { select: { firstName: true, lastName: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: leaves });
});

module.exports = { applyLeave, getMyLeaves };
