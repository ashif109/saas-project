const prisma = require('../config/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Get doubts for a subject/faculty
// @route   GET /api/doubts
// @access  Private (Faculty/Student)
const getDoubts = asyncHandler(async (req, res) => {
    const { subjectId } = req.query;

    const query = {};
    if (subjectId) query.subjectId = subjectId;
    
    if (req.user.role === 'STUDENT') {
        const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id }});
        if(student) query.studentId = student.id;
    } else if (req.user.role === 'FACULTY') {
        const faculty = await prisma.facultyProfile.findUnique({ where: { userId: req.user.id }});
        if(faculty) query.facultyId = faculty.id;
    }

    const doubts = await prisma.doubt.findMany({
        where: query,
        include: {
            student: { select: { user: { select: { firstName: true, lastName: true } } } },
            subject: { select: { name: true } },
            replies: {
                include: {
                    user: { select: { firstName: true, lastName: true, userRoles: { include: { role: true } } } }
                },
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: doubts });
});

// @desc    Reply to a doubt
// @route   POST /api/doubts/:id/reply
// @access  Private
const replyDoubt = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    const reply = await prisma.doubtReply.create({
        data: {
            doubtId: id,
            userId: req.user.id,
            message
        }
    });

    res.status(201).json({ success: true, data: reply });
});

module.exports = { getDoubts, replyDoubt };
