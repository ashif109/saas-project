const prisma = require('../config/prisma');

exports.createAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "Name, startDate and endDate are required." });
    }

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(400).json({ message: "No college context found." });

    const newYear = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        collegeId
      }
    });

    res.status(201).json({
      message: "Academic Year created successfully",
      academicYear: newYear
    });

  } catch (error) {
    console.error('Create Academic Year Error:', error);
    res.status(500).json({ message: "Internal server error create academic year" });
  }
};

exports.getAcademicYears = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(200).json([]);

    const years = await prisma.academicYear.findMany({
      where: { collegeId },
      orderBy: { startDate: 'desc' }
    });

    res.status(200).json(years);
  } catch (error) {
    console.error('Fetch Academic Years Error:', error);
    res.status(500).json({ message: "Internal server error fetching academic years" });
  }
};
