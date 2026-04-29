const prisma = require('../config/prisma');

exports.createSubject = async (req, res) => {
  try {
    const { name, code, credits, courseId, semester } = req.body;

    if (!name || !code || !credits || !courseId || !semester) {
      return res.status(400).json({ message: "All fields (name, code, credits, courseId, semester) are required." });
    }

    const newSubject = await prisma.subject.create({
      data: {
        name,
        code,
        credits: parseInt(credits),
        courseId,
        semester: parseInt(semester)
      }
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject: newSubject
    });
  } catch (error) {
    console.error('Create Subject Error:', error);
    res.status(500).json({ message: "Failed to create subject" });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const subjects = await prisma.subject.findMany({
      where: {
        course: {
          department: {
            collegeId
          }
        }
      },
      include: {
        course: {
          include: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Fetch Subjects Error:', error);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, credits, courseId, semester } = req.body;

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code,
        credits: credits ? parseInt(credits) : undefined,
        courseId,
        semester: semester ? parseInt(semester) : undefined
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Subject Error:', error);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error('Delete Subject Error:', error);
    res.status(500).json({ message: "Delete failed" });
  }
};
