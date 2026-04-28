const prisma = require('../config/prisma');

exports.createCourse = async (req, res) => {
  try {
    const { name, duration, departmentId } = req.body;

    if (!name || !duration || !departmentId) {
      return res.status(400).json({ message: "Name, duration and department are required." });
    }

    const newCourse = await prisma.course.create({
      data: {
        name,
        duration: parseInt(duration),
        departmentId
      }
    });

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse
    });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ message: "Failed to create course" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const courses = await prisma.course.findMany({
      where: { department: { collegeId } },
      include: { department: true, subjects: true, batches: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Fetch Courses Error:', error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration, departmentId } = req.body;
        const updated = await prisma.course.update({
            where: { id },
            data: { name, duration: duration ? parseInt(duration) : undefined, departmentId }
        });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({ where: { id } });
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
}
