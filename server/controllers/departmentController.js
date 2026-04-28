const prisma = require('../config/prisma');

exports.createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required." });
    }

    let collegeId = req.user?.collegeId;
    if (!collegeId) {
      let firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(400).json({ message: "No college context found." });

    const newDept = await prisma.department.create({
      data: {
        name,
        code,
        collegeId
      }
    });

    res.status(201).json({
      message: "Department created successfully",
      department: newDept
    });

  } catch (error) {
    console.error('Create Dept Error:', error);
    res.status(500).json({ message: "Internal server error create department" });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    let collegeId = req.user?.collegeId;
    if (!collegeId) {
      let firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(200).json([]);

    const depts = await prisma.department.findMany({
      where: { collegeId },
      include: {
        _count: {
          select: { faculties: true, courses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(depts);
  } catch (error) {
    console.error('Fetch Depts Error:', error);
    res.status(500).json({ message: "Internal server error fetching departments" });
  }
};
