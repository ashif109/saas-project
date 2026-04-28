const prisma = require('../config/prisma');

exports.createBatch = async (req, res) => {
  try {
    const { name, courseId, academicYearId } = req.body;

    if (!name || !courseId || !academicYearId) {
      return res.status(400).json({ message: "Name, course and academic year are required." });
    }

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const newBatch = await prisma.batch.create({
      data: {
        name,
        courseId,
        academicYearId,
        collegeId
      }
    });

    res.status(201).json({
      message: "Batch created successfully",
      batch: newBatch
    });
  } catch (error) {
    console.error('Create Batch Error:', error);
    res.status(500).json({ message: "Failed to create batch" });
  }
};

exports.getBatches = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const batches = await prisma.batch.findMany({
      where: { collegeId },
      include: { course: true, academicYear: true, _count: { select: { students: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(batches);
  } catch (error) {
    console.error('Fetch Batches Error:', error);
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

exports.updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, courseId, academicYearId } = req.body;
        const updated = await prisma.batch.update({
            where: { id },
            data: { name, courseId, academicYearId }
        });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.batch.delete({ where: { id } });
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
}
