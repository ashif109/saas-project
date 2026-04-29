const prisma = require('../config/prisma');

exports.createScholarship = async (req, res) => {
  try {
    const { name, description, amount, type, status } = req.body;

    if (!name || !amount || !type) {
      return res.status(400).json({ message: "Name, Amount and Type are required." });
    }

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        name,
        description,
        amount: parseFloat(amount),
        type,
        status: status || "ACTIVE",
        collegeId
      }
    });

    res.status(201).json({
      message: "Scholarship created successfully",
      scholarship
    });
  } catch (error) {
    console.error('Create Scholarship Error:', error);
    res.status(500).json({ message: "Failed to create scholarship" });
  }
};

exports.getScholarships = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const scholarships = await prisma.scholarship.findMany({
      where: { collegeId },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(scholarships);
  } catch (error) {
    console.error('Fetch Scholarships Error:', error);
    res.status(500).json({ message: "Failed to fetch scholarships" });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, amount, type, status } = req.body;

    const updated = await prisma.scholarship.update({
      where: { id },
      data: {
        name,
        description,
        amount: amount ? parseFloat(amount) : undefined,
        type,
        status
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Scholarship Error:', error);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.scholarship.delete({ where: { id } });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error('Delete Scholarship Error:', error);
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.applyForScholarship = async (req, res) => {
  try {
    const { scholarshipId, studentId, notes } = req.body;

    if (!scholarshipId || !studentId) {
      return res.status(400).json({ message: "Scholarship and Student are required." });
    }

    // Resolve student profile if userId is provided
    let profileId = studentId;
    const profile = await prisma.studentProfile.findFirst({
        where: { OR: [ { id: studentId }, { userId: studentId } ] }
    });
    if (profile) profileId = profile.id;

    const application = await prisma.scholarshipApplication.create({
      data: {
        scholarshipId,
        studentId: profileId,
        notes,
        status: "PENDING"
      }
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    console.error('Apply Scholarship Error:', error);
    if (error.code === 'P2002') {
        return res.status(400).json({ message: "Student has already applied for this scholarship." });
    }
    res.status(500).json({ message: "Failed to submit application" });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const applications = await prisma.scholarshipApplication.findMany({
      where: { scholarshipId },
      include: {
        student: {
          include: { user: true }
        }
      }
    });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await prisma.scholarshipApplication.update({
      where: { id },
      data: { status, notes }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
