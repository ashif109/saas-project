const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

/**
 * Ensures that basic relational structures (Year, Dept, Course, Batch)
 * exist so we don't crash the strict Prisma relations when creating a student.
 */
async function ensureDefaultBatch(collegeId) {
  // 1. Get or create Academic Year
  let year = await prisma.academicYear.findFirst({ where: { collegeId }});
  if (!year) {
    year = await prisma.academicYear.create({
      data: {
        name: "Current Year",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        collegeId
      }
    });
  }

  // 2. Get or create Dept
  let dept = await prisma.department.findFirst({ where: { collegeId }});
  if (!dept) {
    dept = await prisma.department.create({
      data: { name: "General Department", code: "GEN", collegeId }
    });
  }

  // 3. Get or create Course
  let course = await prisma.course.findFirst({ where: { departmentId: dept.id }});
  if (!course) {
    course = await prisma.course.create({
      data: { name: "General Degree", duration: 4, departmentId: dept.id }
    });
  }

  // 4. Get or create Batch
  let batch = await prisma.batch.findFirst({ where: { collegeId, courseId: course.id }});
  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        name: "Default Gen Batch",
        courseId: course.id,
        academicYearId: year.id,
        collegeId
      }
    });
  }

  return batch;
}

exports.enrollStudent = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, email, department, semester } = req.body;
    
    // Basic Validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required fields." });
    }

    // req.user might be from authMiddleware
    // If not, we will rely on a collegeId passed or fallback to first college for dev testing
    let collegeId = req.user?.collegeId;
    if (!collegeId) {
      let firstCollege = await prisma.college.findFirst();
      if (!firstCollege) {
        // Auto-seed for fresh production deployment
        firstCollege = await prisma.college.create({
          data: { name: "PulseDesk Default", address: "Cloud Provider", subdomain: "default" }
        });
      }
      collegeId = firstCollege.id;
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Auto-generate generic batch to prevent relation crashing
    const batch = await ensureDefaultBatch(collegeId);

    // Split name safely
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create User & StudentProfile in a transaction
    const hashedPassword = await bcrypt.hash('Student@123', 10);
    const enrollmentNo = `ENR${Math.random().toString().slice(2, 8)}`;

    const newStudent = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        collegeId,
        isActive: true,
        studentProfile: {
          create: {
            enrollmentNo,
            admissionDate: new Date(),
            batchId: batch.id
          }
        }
      },
      include: { studentProfile: true }
    });

    res.status(201).json({
      message: "Student enrolled successfully",
      student: {
        _id: newStudent.id,
        id: newStudent.studentProfile.enrollmentNo,
        name: `${newStudent.firstName} ${newStudent.lastName}`,
        email: newStudent.email,
        department: department || 'General',
        semester: semester || '1',
        status: newStudent.isActive ? 'Active' : 'Inactive'
      }
    });

  } catch (error) {
    console.error('Enroll Error Details:', error);
    
    // Check for Prisma specific errors (e.g., connection timeout, validation error)
    if (error.code) {
      console.error(`Prisma Error Code: ${error.code}`);
    }
    
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message || String(error)
    });
  }
};

exports.getStudents = async (req, res) => {
  try {
    let collegeId = req.user?.collegeId;
    if (!collegeId) {
      let firstCollege = await prisma.college.findFirst();
      if (!firstCollege) {
        firstCollege = await prisma.college.create({
          data: { name: "PulseDesk Default", address: "Cloud Provider", subdomain: "default" }
        });
      }
      collegeId = firstCollege.id;
    }

    const students = await prisma.user.findMany({
      where: {
        collegeId,
        studentProfile: { isNot: null }
      },
      include: {
        studentProfile: {
          include: {
            batch: {
              include: { course: { include: { department: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format for frontend
    const mapped = students.map(s => {
      const deptName = s.studentProfile?.batch?.course?.department?.name || 'General';
      return {
        _id: s.id, // raw mongo id
        id: s.studentProfile?.enrollmentNo, // friendly view id
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        department: deptName,
        semester: '1st Semester', // Usually derived from batch/subject mappings
        status: s.isActive ? 'Active' : 'Suspended'
      };
    });

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Fetch Students Error:', error);
    res.status(500).json({ message: "Internal server error fetching students" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params; // This will actually be the enrollment id for safety or the user mapped _id

    const user = await prisma.user.findFirst({
      where: { id: id },
      include: { studentProfile: true }
    });

    if (!user) return res.status(404).json({ message: "Student not found" });

    // Actually delete or suspend
    await prisma.user.delete({ where: { id: user.id }});

    res.status(200).json({ message: "Student record securely deleted" });
  } catch (error) {
    console.error('Delete Student Error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
