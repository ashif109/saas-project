const prisma = require('../config/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Add or update internal marks
// @route   POST /api/marks
// @access  Private (Faculty/Admin)
const submitMarks = asyncHandler(async (req, res) => {
    const { studentId, subjectId, examName, marksObtained, maxMarks } = req.body;

    if (!studentId || !subjectId || !examName || marksObtained === undefined || !maxMarks) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Check if marks already exist for this student, subject, and exam
    const existingMark = await prisma.internalMark.findFirst({
        where: {
            studentId,
            subjectId,
            examName
        }
    });

    let mark;
    if (existingMark) {
        mark = await prisma.internalMark.update({
            where: { id: existingMark.id },
            data: { marksObtained, maxMarks }
        });
    } else {
        mark = await prisma.internalMark.create({
            data: {
                studentId,
                subjectId,
                examName,
                marksObtained,
                maxMarks
            }
        });
    }

    res.status(200).json({ success: true, data: mark });
});

// @desc    Get internal marks by subject and batch
// @route   GET /api/marks
// @access  Private
const getMarks = asyncHandler(async (req, res) => {
    const { subjectId, batchId } = req.query;

    if (!subjectId) {
        res.status(400);
        throw new Error('Subject ID is required');
    }

    const marks = await prisma.internalMark.findMany({
        where: {
            subjectId,
            student: batchId ? { batchId } : undefined
        },
        include: {
            student: {
                select: { id: true, name: true, enrollmentNo: true }
            }
        }
    });

    res.status(200).json({ success: true, data: marks });
});

module.exports = { submitMarks, getMarks };
