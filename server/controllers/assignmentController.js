const prisma = require('../config/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Faculty/Admin)
const createAssignment = asyncHandler(async (req, res) => {
    const { title, description, fileUrl, dueDate, subjectId } = req.body;
    
    // We expect req.user.facultyProfile.id to be available if they are a faculty member
    // But since req.user may not have facultyProfile loaded by default, we look it up
    const faculty = await prisma.facultyProfile.findUnique({
        where: { userId: req.user.id }
    });

    if (!faculty) {
        res.status(403);
        throw new Error('Only faculty can create assignments');
    }

    const assignment = await prisma.assignment.create({
        data: {
            title,
            description,
            fileUrl,
            dueDate: new Date(dueDate),
            subjectId,
            facultyId: faculty.id
        }
    });

    res.status(201).json({ success: true, data: assignment });
});

// @desc    Get assignments for a subject
// @route   GET /api/assignments?subjectId=xxx
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
    const { subjectId } = req.query;

    const assignments = await prisma.assignment.findMany({
        where: subjectId ? { subjectId } : {},
        include: {
            faculty: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
            subject: { select: { name: true, code: true } },
            _count: { select: { submissions: true } }
        },
        orderBy: { dueDate: 'desc' }
    });

    res.status(200).json({ success: true, data: assignments });
});

// @desc    Grade an assignment submission
// @route   PUT /api/assignments/submissions/:id/grade
// @access  Private (Faculty/Admin)
const gradeSubmission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    const submission = await prisma.assignmentSubmission.update({
        where: { id },
        data: {
            marks,
            feedback,
            status: 'GRADED'
        }
    });

    res.status(200).json({ success: true, data: submission });
});

module.exports = { createAssignment, getAssignments, gradeSubmission };
