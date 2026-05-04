const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../services/emailService');
const { createLog } = require('./logController');

const validator = {
  email: (v) => /\S+@\S+\.\S+/.test(v),
};

// Helper to get system settings with fallback
const getSettings = async () => {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: {} });
  }
  return settings;
};

// @desc    Register a new college
// @route   POST /api/colleges
// @access  Private/SuperAdmin
const registerCollege = asyncHandler(async (req, res) => {
  const { 
    name, 
    code, 
    email, 
    phone, 
    website, 
    logoUrl, 
    address, 
    city, 
    state, 
    country, 
    adminName, 
    adminEmail, 
    adminPassword, 
    subscription, 
    features 
  } = req.body;

  const settings = await getSettings();

  // Validate Admin Password Length
  const minLength = parseInt(settings.minPasswordLength) || 8;
  if (adminPassword.length < minLength) {
    res.status(400);
    throw new Error(`Admin password must be at least ${minLength} characters long`);
  }

  // Check Max Colleges Limit
  const collegeCount = await prisma.college.count();
  if (collegeCount >= parseInt(settings.maxColleges)) {
    res.status(403);
    throw new Error(`Platform limit reached: Maximum of ${settings.maxColleges} colleges allowed.`);
  }

  // Check if college already exists
  const collegeExists = await prisma.college.findFirst({
    where: {
      OR: [
        { name: { equals: name.trim(), mode: 'insensitive' } },
        { code: code.trim().toUpperCase() }
      ]
    }
  });

  if (collegeExists) {
    res.status(409);
    throw new Error(`College with name "${name}" or code "${code}" already exists`);
  }

  // Check if admin email already exists
  const userExists = await prisma.user.findUnique({ 
    where: { email: adminEmail.trim().toLowerCase() } 
  });
  if (userExists) {
    res.status(409);
    throw new Error(`User with email "${adminEmail}" already exists`);
  }

  let initialStatus = 'Active';
  if (settings.approvalRequirement && !settings.autoApproval) {
    initialStatus = 'Pending';
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const nameParts = adminName?.trim().split(' ') || ['College', 'Admin'];
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const college = await prisma.college.create({
    data: {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone,
      website,
      logoUrl,
      address,
      city,
      state,
      country: country || 'India',
      status: req.body.status || initialStatus,
      subscription: {
        plan: subscription || settings.defaultPlan,
        status: 'Active',
        paymentStatus: 'Paid',
        startDate: new Date(),
        history: []
      },
      features: features || {
        doubtSystem: settings.globalDoubtSystem,
        attendance: settings.globalAttendance,
        analytics: settings.globalAnalytics
      },
      limits: {
        students: parseInt(settings.studentLimit) || 5000,
        faculty: parseInt(settings.facultyLimit) || 250
      },
      users: {
        create: {
          name: adminName || 'College Admin',
          firstName,
          lastName,
          email: adminEmail.trim().toLowerCase(),
          password: hashedPassword,
          role: 'COLLEGE_ADMIN',
          isActive: true,
          mustChangePassword: settings.forcePasswordReset
        }
      }
    }
  });

  if (college) {
    await createLog({
      user: req.user.id || req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'College Registered',
      module: 'Colleges',
      details: `New college registered: ${name} (Admin: ${adminEmail}). Status: ${initialStatus}`,
      severity: 'Info',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (settings.sendWelcomeEmail) {
      try {
        await sendWelcomeEmail(adminEmail, adminPassword, name, settings.sendCredentials);
      } catch (err) {
        console.error('Email sending failed:', err);
      }
    }

    res.status(201).json(college);
  } else {
    res.status(400);
    throw new Error('Invalid college data');
  }
});

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Private/SuperAdmin
const getColleges = asyncHandler(async (req, res) => {
  const colleges = await prisma.college.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(colleges);
});

// @desc    Get college admin
// @route   GET /api/colleges/:id/admin
// @access  Private/SuperAdmin
const getCollegeAdmin = asyncHandler(async (req, res) => {
  const admin = await prisma.user.findFirst({ 
    where: { 
      collegeId: req.params.id,
      role: 'COLLEGE_ADMIN'
    }
  });

  if (!admin) {
    res.status(404);
    throw new Error('College admin not found');
  }

  res.json(admin);
});

// @desc    Get college by ID
// @route   GET /api/colleges/:id
// @access  Private
const getCollegeById = asyncHandler(async (req, res) => {
  const college = await prisma.college.findUnique({
    where: { id: req.params.id }
  });

  if (college) {
    res.json(college);
  } else {
    res.status(404);
    throw new Error('College not found');
  }
});

// @desc    Update college status
// @route   PUT /api/colleges/:id/status
// @access  Private/SuperAdmin
const updateCollegeStatus = asyncHandler(async (req, res) => {
  const college = await prisma.college.findUnique({ where: { id: req.params.id } });

  if (college) {
    const newStatus = req.body.status || college.status;
    const subData = college.subscription || {};
    
    if (newStatus === 'Disabled') {
      subData.status = 'Disabled';
    } else if (newStatus === 'Active' && subData.status === 'Disabled') {
      subData.status = 'Active';
    }
    
    const updatedCollege = await prisma.college.update({
      where: { id: req.params.id },
      data: { 
        status: newStatus,
        subscription: subData
      }
    });
    res.json(updatedCollege);
  } else {
    res.status(404);
    throw new Error('College not found');
  }
});

// @desc    Extend college subscription
// @route   POST /api/colleges/:id/extend
// @access  Private/SuperAdmin
const extendSubscription = asyncHandler(async (req, res) => {
  const { days, months, message } = req.body;
  const college = await prisma.college.findUnique({ where: { id: req.params.id } });

  if (college) {
    const subData = college.subscription || {};
    const currentExpiry = subData.expiryDate ? new Date(subData.expiryDate) : new Date();
    const newExpiry = new Date(currentExpiry);
    
    if (days) newExpiry.setDate(newExpiry.getDate() + days);
    if (months) newExpiry.setMonth(newExpiry.getMonth() + months);

    subData.expiryDate = newExpiry;
    if (!subData.history) subData.history = [];
    subData.history.push({
      action: 'extended',
      date: new Date(),
      message: message || `Subscription extended by ${days || 0} days and ${months || 0} months`
    });

    const daysLeft = Math.ceil((newExpiry - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 7) subData.status = 'Active';
    else if (daysLeft > 0) subData.status = 'Expiring Soon';

    const updatedCollege = await prisma.college.update({
      where: { id: req.params.id },
      data: { subscription: subData }
    });
    res.json(updatedCollege);
  } else {
    res.status(404);
    throw new Error('College not found');
  }
});

// @desc    Change college plan
// @route   POST /api/colleges/:id/change-plan
// @access  Private/SuperAdmin
const changePlan = asyncHandler(async (req, res) => {
  const { plan, message } = req.body;
  const college = await prisma.college.findUnique({ where: { id: req.params.id } });

  if (college) {
    const subData = college.subscription || {};
    const previousPlan = subData.plan;
    subData.plan = plan;
    if (!subData.history) subData.history = [];
    subData.history.push({
      action: 'upgraded/downgraded',
      date: new Date(),
      previousPlan,
      newPlan: plan,
      message: message || `Plan changed from ${previousPlan} to ${plan}`
    });

    const updatedCollege = await prisma.college.update({
      where: { id: req.params.id },
      data: { subscription: subData }
    });
    res.json(updatedCollege);
  } else {
    res.status(404);
    throw new Error('College not found');
  }
});

// @desc    Cancel college subscription
// @route   POST /api/colleges/:id/cancel
// @access  Private/SuperAdmin
const cancelSubscription = asyncHandler(async (req, res) => {
  const { message, disableAccess } = req.body;
  const college = await prisma.college.findUnique({ where: { id: req.params.id } });

  if (college) {
    const subData = college.subscription || {};
    subData.status = 'Cancelled';
    if (!subData.history) subData.history = [];
    subData.history.push({
      action: 'cancelled',
      date: new Date(),
      message: message || 'Subscription cancelled by administrator'
    });

    const updatedCollege = await prisma.college.update({
      where: { id: req.params.id },
      data: { 
        status: disableAccess ? 'Disabled' : college.status,
        subscription: subData 
      }
    });
    res.json(updatedCollege);
  } else {
    res.status(404);
    throw new Error('College not found');
  }
});

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private/SuperAdmin
const deleteCollege = asyncHandler(async (req, res) => {
  // Prisma delete will cascade if set up, or we can do it manually
  // In our schema, we have onDelete: Cascade for most relations, but Restrict for CollegeUsers
  // So we need to delete users first if we don't want to change the schema
  
  await prisma.user.deleteMany({ where: { collegeId: req.params.id } });
  await prisma.college.delete({ where: { id: req.params.id } });
  
  res.json({ message: 'College and associated users removed' });
});

// Unified create method (matches what Super Admin likely uses)
const createCollegeWithAdmin = asyncHandler(async (req, res) => {
    const {
      name,
      code,
      email,
      phone,
      website,
      logoUrl,
      address,
      city,
      state,
      country,
      adminName,
      adminEmail,
      adminPassword,
      subscription,
      features,
    } = req.body;

    if (!name || !code || !email || !adminEmail || !adminPassword) {
      res.status(400);
      throw new Error('Missing required fields');
    }

    // Check for collision
    const existing = await prisma.college.findFirst({
      where: {
        OR: [
          { name: { equals: name.trim(), mode: 'insensitive' } },
          { code: code.trim().toUpperCase() }
        ]
      }
    });
    
    if (existing) {
      res.status(409);
      throw new Error(`College already exists with this name or code`);
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { email: adminEmail.trim().toLowerCase() } 
    });
    if (existingUser) {
      res.status(409);
      throw new Error(`User with email ${adminEmail.trim()} already exists`);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const nameParts = adminName?.trim().split(' ') || ['College', 'Admin'];
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const college = await prisma.college.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        website: website?.trim(),
        logoUrl,
        address: address?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        country: country || 'India',
        status: req.body.status || 'Active',
        subscription: {
          plan: subscription,
          status: 'Active',
          paymentStatus: 'Paid',
          startDate: new Date()
        },
        features,
        users: {
          create: {
            name: adminName?.trim() || 'College Admin',
            firstName,
            lastName,
            email: adminEmail.trim().toLowerCase(),
            password: hashedPassword,
            role: 'COLLEGE_ADMIN',
            isActive: true,
            mustChangePassword: true,
          }
        }
      }
    });

    try {
      await sendWelcomeEmail(adminEmail.trim().toLowerCase(), adminPassword, college.name);
    } catch (e) {
      console.error('Email sending failed:', e.message);
    }

    res.status(201).json({
      college,
      emailSent: true,
    });
});

module.exports = {
  registerCollege,
  getColleges,
  getCollegeById,
  getCollegeAdmin,
  updateCollegeStatus,
  deleteCollege,
  extendSubscription,
  changePlan,
  cancelSubscription,
  reactivateSubscription: asyncHandler(async (req, res) => {
    const { message } = req.body;
    const college = await prisma.college.update({
      where: { id: req.params.id },
      data: { status: 'Active' }
    });
    res.json(college);
  }),
  updatePaymentStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const college = await prisma.college.findUnique({ where: { id: req.params.id } });
    if (college) {
        const subData = college.subscription || {};
        subData.paymentStatus = status;
        const updated = await prisma.college.update({
            where: { id: req.params.id },
            data: { subscription: subData }
        });
        res.json(updated);
    } else {
        res.status(404);
        throw new Error('College not found');
    }
  }),
  createCollegeWithAdmin,

  resendCredentials: asyncHandler(async (req, res) => {
    const { adminEmail, collegeCode } = req.body;
    
    let user;
    if (adminEmail) {
      user = await prisma.user.findFirst({ 
        where: { email: adminEmail.trim().toLowerCase(), role: 'COLLEGE_ADMIN' },
        include: { college: true }
      });
    } else if (collegeCode) {
      user = await prisma.user.findFirst({
        where: { college: { code: collegeCode.toUpperCase() }, role: 'COLLEGE_ADMIN' },
        include: { college: true }
      });
    }

    if (!user) {
      res.status(404);
      throw new Error('Admin user not found');
    }

    const tempPassword = Math.random().toString(36).slice(-10) + 'A!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    });

    try {
      await sendWelcomeEmail(user.email, tempPassword, user.college?.name || 'Pulse College');
      res.json({ message: 'Credentials email sent' });
    } catch (e) {
      res.json({ message: 'Credentials processed (fallback mode)' });
    }
  })
};
