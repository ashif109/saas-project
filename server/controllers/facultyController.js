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
        _id: newFaculty.id,
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
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(200).json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } });

    // Build filter query
    const where = {
      collegeId,
      facultyProfile: { isNot: null }
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { facultyProfile: { employeeId: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [faculties, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          facultyProfile: {
            include: {
              department: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    const mapped = faculties.map(f => ({
      _id: f.id,
      id: f.facultyProfile?.employeeId,
      name: `${f.firstName} ${f.lastName}`,
      email: f.email,
      role: 'Professor', 
      department: f.facultyProfile?.department?.name || 'General',
      expertise: 'General',
      assignedSubjects: [],
      status: 'Available'
    }));

    res.status(200).json({
      data: mapped,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / take)
      }
    });
  } catch (error) {
    console.error('Fetch Faculty Error:', error);
    res.status(500).json({ message: "Internal server error fetching faculty" });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, designation, departmentId } = req.body;

    const nameParts = name ? name.trim().split(' ') : [];
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        facultyProfile: {
          update: {
            departmentId: departmentId
          }
        }
      },
      include: {
        facultyProfile: {
          include: { department: true }
        }
      }
    });

    res.status(200).json({
      message: "Faculty updated",
      faculty: {
        _id: updated.id,
        id: updated.facultyProfile.employeeId,
        name: `${updated.firstName} ${updated.lastName}`,
        email: updated.email,
        department: updated.facultyProfile.department?.name || 'General',
        role: designation || 'Professor',
        status: 'Available'
      }
    });
  } catch (error) {
    console.error('Update Faculty Error:', error);
    res.status(500).json({ message: "Failed to update faculty" });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete profile first if cascade not configured
    await prisma.facultyProfile.deleteMany({
      where: { userId: id }
    });

    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({ message: "Faculty removed successfully" });
  } catch (error) {
    console.error('Delete Faculty Error:', error);
    res.status(500).json({ message: "Failed to delete faculty" });
  }
};
