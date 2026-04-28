const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

exports.onboardFaculty = async (req, res) => {
  try {
    const { name, email, departmentId, designation } = req.body;

    if (!name || !email || !departmentId) {
      return res.status(400).json({ message: "Name, email and department are required." });
    }

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      if (!firstCollege) {
        firstCollege = await prisma.college.create({
          data: { name: "PulseDesk Default", address: "Cloud Provider", subdomain: "default" }
        });
      }
      collegeId = firstCollege.id;
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Split name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const hashedPassword = await bcrypt.hash('Faculty@123', 10);
    const employeeId = `FAC${Math.random().toString().slice(2, 8)}`;

    const newFaculty = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        collegeId,
        isActive: true,
        facultyProfile: {
          create: {
            employeeId,
            joiningDate: new Date(),
            departmentId: departmentId
          }
        }
      },
      include: { facultyProfile: true }
    });

    res.status(201).json({
      message: "Faculty onboarded successfully",
      faculty: {
        id: newFaculty.facultyProfile.employeeId,
        name: `${newFaculty.firstName} ${newFaculty.lastName}`,
        email: newFaculty.email,
        role: designation || 'Professor',
        departmentId: newFaculty.facultyProfile.departmentId,
        status: 'Available'
      }
    });

  } catch (error) {
    console.error('Faculty Onboard Error:', error);
    res.status(500).json({ message: "Internal server error onboard faculty", error: error.message });
  }
};

exports.getFaculties = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(200).json([]);

    const faculties = await prisma.user.findMany({
      where: {
        collegeId,
        facultyProfile: { isNot: null }
      },
      include: {
        facultyProfile: {
          include: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = faculties.map(f => ({
      id: f.facultyProfile?.employeeId,
      name: `${f.firstName} ${f.lastName}`,
      email: f.email,
      role: 'Professor', // This could be saved in a 'designation' field in FacultyProfile if we had one, but the schema doesn't have it yet. 
      // I'll stick to a default or we can add it to schema. 
      // Actually, let's just use 'Professor' for now as per the placeholder.
      department: f.facultyProfile?.department?.name || 'General',
      expertise: 'General',
      assignedSubjects: [],
      status: 'Available'
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch Faculty Error:', error);
    res.status(500).json({ message: "Internal server error fetching faculty" });
  }
};
