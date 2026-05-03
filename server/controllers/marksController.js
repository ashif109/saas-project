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

    const existingMark = await prisma.internalMark.findFirst({
        where: { studentId, subjectId, examName }
    });

    let mark;
    if (existingMark) {
        mark = await prisma.internalMark.update({
            where: { id: existingMark.id },
            data: { marksObtained: parseFloat(marksObtained), maxMarks: parseFloat(maxMarks) }
        });
    } else {
        mark = await prisma.internalMark.create({
            data: { studentId, subjectId, examName, marksObtained: parseFloat(marksObtained), maxMarks: parseFloat(maxMarks) }
        });
    }

    res.status(200).json({ success: true, data: mark });
});

// @desc    Add or update internal marks in bulk
// @route   POST /api/marks/bulk
// @access  Private (Faculty/Admin)
const submitBulkMarks = asyncHandler(async (req, res) => {
    const { subjectId, batchId, examName, maxMarks, marksData } = req.body;

    if (!subjectId || !batchId || !examName || !maxMarks || !marksData) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    await prisma.$transaction(async (tx) => {
        for (const [studentId, marksObtained] of Object.entries(marksData)) {
            const existingMark = await tx.internalMark.findFirst({
                where: {
                    studentId,
                    subjectId,
                    examName
                }
            });

            if (existingMark) {
                await tx.internalMark.update({
                    where: { id: existingMark.id },
                    data: { 
                        marksObtained: parseFloat(marksObtained), 
                        maxMarks: parseFloat(maxMarks) 
                    }
                });
            } else {
                await tx.internalMark.create({
                    data: {
                        studentId,
                        subjectId,
                        examName,
                        marksObtained: parseFloat(marksObtained),
                        maxMarks: parseFloat(maxMarks)
                    }
                });
            }
        }
    });

    res.status(200).json({ success: true, message: 'Marks submitted successfully' });
});

// @desc    Get internal marks by subject and batch
// @route   GET /api/marks
// @access  Private
const getMarks = asyncHandler(async (req, res) => {
    const { subjectId, batchId, examName } = req.query;

    if (!subjectId) {
        res.status(400);
        throw new Error('Subject ID is required');
    }

    const marks = await prisma.internalMark.findMany({
        where: {
            subjectId,
            examName,
            student: batchId ? { batchId } : undefined
        },
        include: {
            student: {
                include: {
                    user: {
                        select: { firstName: true, lastName: true }
                    }
                }
            }
        }
    });

    res.status(200).json({ success: true, data: marks });
});

module.exports = { submitMarks, submitBulkMarks, getMarks };
