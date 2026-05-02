const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: "Name and code are required." });
  }

  let collegeId = req.user?.college || req.user?.collegeId;
  if (!collegeId) {
    const firstCollege = await prisma.college.findFirst();
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
});

exports.getDepartments = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;

  let collegeId = req.user?.college || req.user?.collegeId;
  if (!collegeId) {
    const firstCollege = await prisma.college.findFirst();
    collegeId = firstCollege?.id;
  }

  if (!collegeId) return res.status(200).json([]);

  const where = { collegeId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } }
    ];
  }

  const depts = await prisma.department.findMany({
    where,
    include: {
      _count: {
        select: { faculties: true, courses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json(depts);
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;

  const updatedDept = await prisma.department.update({
    where: { id },
    data: { name, code }
  });

  res.status(200).json({
    message: "Department updated successfully",
    department: updatedDept
  });
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check for dependencies before deleting
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { faculties: true, courses: true } } }
  });

  if (dept._count.faculties > 0 || dept._count.courses > 0) {
    return res.status(400).json({ 
      message: "Cannot delete department with active faculty or courses. Please reassign them first." 
    });
  }

  await prisma.department.delete({
    where: { id }
  });

  res.status(200).json({
    message: "Department deleted successfully"
  });
});
