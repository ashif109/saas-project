const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { sendWelcomeEmail } = require('../utils/emailService');

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

exports.enrollStudent = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const { name, email, department, semester } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required fields." });
  }

  let collegeId = req.user?.college || req.user?.collegeId;
  if (!collegeId) {
    const firstCollege = await prisma.college.findFirst();
    collegeId = firstCollege?.id;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: "Email is already registered." });
  }

  const batch = await ensureDefaultBatch(collegeId);

  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const defaultPassword = 'Student@123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
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
    include: { studentProfile: true, college: true }
  });

  // Send Welcome Email
  const origin = req.get('origin') || req.get('referer');
  await sendWelcomeEmail(newStudent, defaultPassword, newStudent.college?.name, origin);

  res.status(201).json({
    message: "Student enrolled successfully and welcome email sent.",
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
});

exports.getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', department, semester, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  let collegeId = req.user?.collegeId;
  if (!collegeId) {
    let firstCollege = await prisma.college.findFirst();
    collegeId = firstCollege?.id;
  }

  // Build filter query
  const where = {
    collegeId,
    studentProfile: { isNot: null }
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { studentProfile: { enrollmentNo: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (department) {
    where.studentProfile = {
      ...where.studentProfile,
      batch: { course: { departmentId: department } }
    };
  }

  if (status) {
    where.isActive = status === 'Active';
  }

  const [students, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        studentProfile: {
          include: {
            batch: {
              include: { course: { include: { department: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.user.count({ where })
  ]);

  // Format for frontend
  const mapped = students.map(s => {
    const deptName = s.studentProfile?.batch?.course?.department?.name || 'General';
    return {
      _id: s.id,
      id: s.studentProfile?.enrollmentNo,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      department: deptName,
      semester: '1st Semester', 
      status: s.isActive ? 'Active' : 'Suspended'
    };
  });

  res.status(200).json({
    data: mapped,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / take)
    }
  });
});

exports.bulkEnrollStudents = asyncHandler(async (req, res) => {
  const { students } = req.body; 
  
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ message: "Invalid students data" });
  }

  let collegeId = req.user?.collegeId;
  if (!collegeId) {
    const firstCollege = await prisma.college.findFirst();
    collegeId = firstCollege?.id;
  }

  const batch = await ensureDefaultBatch(collegeId);
  const defaultPassword = 'Student@123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const results = [];
  const errors = [];

  await prisma.$transaction(async (tx) => {
    for (const s of students) {
      try {
        const { name, email } = s;
        
        const existing = await tx.user.findUnique({ where: { email } });
        if (existing) {
          errors.push({ email, error: "Email already exists" });
          continue;
        }

        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        const enrollmentNo = `ENR${Math.random().toString().slice(2, 8)}`;

        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            collegeId,
            studentProfile: {
              create: {
                enrollmentNo,
                admissionDate: new Date(),
                batchId: batch.id
              }
            }
          }
        });
        
        // We trigger email asynchronously outside of the loop if possible, 
        // but for now let's just send it. 
        // Note: In high-scale this should be queued.
        const origin = req.get('origin') || req.get('referer');
        await sendWelcomeEmail(newUser, defaultPassword, null, origin);
        
        results.push({ email, status: "Success" });
      } catch (err) {
        errors.push({ email: s.email, error: err.message });
      }
    }
  });

  res.status(201).json({
    message: "Bulk enrollment completed",
    successCount: results.length,
    errorCount: errors.length,
    errors
  });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findFirst({
    where: { id: id },
    include: { studentProfile: true }
  });

  if (!user) return res.status(404).json({ message: "Student not found" });

  await prisma.user.delete({ where: { id: user.id }});

  res.status(200).json({ message: "Student record securely deleted" });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status } = req.body;

  const user = await prisma.user.findFirst({
    where: { id: id },
    include: { studentProfile: true }
  });

  if (!user) return res.status(404).json({ message: "Student not found" });

  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email is already registered to another user." });
  }

  const dataToUpdate = {};
  if (name) {
    const parts = name.trim().split(' ');
    dataToUpdate.firstName = parts[0];
    dataToUpdate.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  }
  if (email) dataToUpdate.email = email;
  if (phone !== undefined) dataToUpdate.phone = phone;
  if (status !== undefined) dataToUpdate.isActive = status === 'Active';

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: dataToUpdate,
    include: {
      studentProfile: {
        include: {
          batch: {
            include: { course: { include: { department: true } } }
          }
        }
      }
    }
  });

  const deptName = updatedUser.studentProfile?.batch?.course?.department?.name || 'General';

  res.status(200).json({
    message: "Student profile updated successfully",
    student: {
      _id: updatedUser.id,
      id: updatedUser.studentProfile?.enrollmentNo,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      department: deptName,
      semester: '1st Semester',
      status: updatedUser.isActive ? 'Active' : 'Suspended'
    }
  });
});

exports.resendWelcomeEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true, college: true }
  });

  if (!user || !user.studentProfile) {
    return res.status(404).json({ message: "Student not found." });
  }

  const defaultPassword = 'Student@123';
  
  const origin = req.get('origin') || req.get('referer');
  await sendWelcomeEmail(user, defaultPassword, user.college?.name, origin);

  res.status(200).json({ message: "Welcome email resent successfully." });
});
