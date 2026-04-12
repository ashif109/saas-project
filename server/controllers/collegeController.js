const asyncHandler = require('express-async-handler');
const College = require('../models/College');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const { sendWelcomeEmail } = require('../services/emailService');
const { createLog } = require('./logController');
const validator = {
  email: (v) => /\S+@\S+\.\S+/.test(v),
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

  // Fetch Global System Settings
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }

  // Validate Admin Password Length
  const minLength = parseInt(settings.minPasswordLength) || 8;
  if (adminPassword.length < minLength) {
    res.status(400);
    throw new Error(`Admin password must be at least ${minLength} characters long`);
  }

  // Check Max Colleges Limit
  const collegeCount = await College.countDocuments();
  if (collegeCount >= parseInt(settings.maxColleges)) {
    res.status(403);
    throw new Error(`Platform limit reached: Maximum of ${settings.maxColleges} colleges allowed.`);
  }

  // Check if college already exists
  let query = { code: code.toUpperCase() };
  if (settings.duplicateNameRestriction) {
    query = { 
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } }, 
        { code: code.toUpperCase() }
      ] 
    };
  }

  const collegeExists = await College.findOne(query);

  if (collegeExists) {
    await createLog({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'College Registration Failure',
      module: 'Colleges',
      details: `Attempted to register duplicate college: ${name}`,
      severity: 'Warning',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.status(409); // Conflict
    throw new Error(`College with name "${name}" or code "${code}" already exists`);
  }

  // Check if admin email already exists
  const userExists = await User.findOne({ email: adminEmail });
  if (userExists) {
    res.status(409); // Conflict
    throw new Error(`User with email "${adminEmail}" already exists`);
  }

  // Determine initial status based on settings
  // If autoApproval is true OR approvalRequirement is false, set to Active
  // Otherwise, set to Pending
  let initialStatus = 'Active';
  if (settings.approvalRequirement && !settings.autoApproval) {
    initialStatus = 'Pending';
  }

  const college = await College.create({
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
    status: req.body.status || initialStatus,
    subscription: {
      plan: subscription || settings.defaultPlan,
      status: 'Active',
      paymentStatus: 'Paid'
    },
    features: features || {
       doubtSystem: settings.globalDoubtSystem,
       attendance: settings.globalAttendance,
       analytics: settings.globalAnalytics
     },
     limits: {
       students: parseInt(settings.studentLimit) || 5000,
       faculty: parseInt(settings.facultyLimit) || 250
     }
   });

  if (college) {
    // Create College Admin User
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'COLLEGE_ADMIN',
      college: college._id,
      mustChangePassword: settings.forcePasswordReset
    });

    await createLog({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'College Registered',
      module: 'Colleges',
      details: `New college registered: ${name} (Admin: ${adminEmail}). Status: ${initialStatus}`,
      severity: 'Info',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Send Welcome Email if enabled
    if (settings.sendWelcomeEmail) {
      try {
        await sendWelcomeEmail(adminEmail, adminPassword, name, settings.sendCredentials);
      } catch (err) {
        console.error('Failed to send welcome email:', err);
        // Don't fail the registration if email fails
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
  const colleges = await College.find({});
  res.json(colleges);
});

// @desc    Get college admin
// @route   GET /api/colleges/:id/admin
// @access  Private/SuperAdmin
const getCollegeAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ 
    college: req.params.id,
    role: 'COLLEGE_ADMIN'
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
  const college = await College.findById(req.params.id);

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
  const college = await College.findById(req.params.id);

  if (college) {
    college.status = req.body.status || college.status;
    if (req.body.status === 'Disabled') {
      college.subscription.status = 'Disabled';
    } else if (req.body.status === 'Active' && college.subscription.status === 'Disabled') {
      college.subscription.status = 'Active';
    }
    
    const updatedCollege = await college.save();
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
  const college = await College.findById(req.params.id);

  if (college) {
    const currentExpiry = college.subscription.expiryDate || new Date();
    const newExpiry = new Date(currentExpiry);
    
    if (days) newExpiry.setDate(newExpiry.getDate() + days);
    if (months) newExpiry.setMonth(newExpiry.getMonth() + months);

    college.subscription.expiryDate = newExpiry;
    college.subscription.history.push({
      action: 'extended',
      message: message || `Subscription extended by ${days || 0} days and ${months || 0} months`
    });

    // Update status based on new expiry
    const daysLeft = Math.ceil((newExpiry - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 7) college.subscription.status = 'Active';
    else if (daysLeft > 0) college.subscription.status = 'Expiring Soon';

    const updatedCollege = await college.save();
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
  const college = await College.findById(req.params.id);

  if (college) {
    const previousPlan = college.subscription.plan;
    college.subscription.plan = plan;
    college.subscription.history.push({
      action: 'upgraded/downgraded',
      previousPlan,
      newPlan: plan,
      message: message || `Plan changed from ${previousPlan} to ${plan}`
    });

    const updatedCollege = await college.save();
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
  const college = await College.findById(req.params.id);

  if (college) {
    college.subscription.status = 'Cancelled';
    if (disableAccess) {
      college.status = 'Disabled';
    }
    
    college.subscription.history.push({
      action: 'cancelled',
      message: message || 'Subscription cancelled by administrator'
    });

    const updatedCollege = await college.save();
    res.json(updatedCollege);
  } else {
    res.status(404);
    throw new Error('College not found');
  }
});

// @desc    Reactivate college subscription
// @route   POST /api/colleges/:id/reactivate
// @access  Private/SuperAdmin
const reactivateSubscription = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const college = await College.findById(req.params.id);

  if (college) {
    college.subscription.status = 'Active';
    college.status = 'Active';
    
    college.subscription.history.push({
      action: 'reactivated',
      message: message || 'Subscription reactivated by administrator'
    });

    const updatedCollege = await college.save();
    res.json(updatedCollege);
  } else {
    res.status(404);
    throw new Error('College not found');
  }
});

// @desc    Update payment status
// @route   POST /api/colleges/:id/payment
// @access  Private/SuperAdmin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const college = await College.findById(req.params.id);

  if (college) {
    college.subscription.paymentStatus = status;
    if (status === 'Paid') {
      college.subscription.lastPaymentDate = new Date();
    }
    
    college.subscription.history.push({
      action: 'payment',
      paymentStatus: status,
      message: message || `Payment status updated to ${status}`
    });

    const updatedCollege = await college.save();
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
  const college = await College.findById(req.params.id);

  if (college) {
    // Delete all users associated with this college
    await User.deleteMany({ college: college._id });
    
    // Use deleteOne() instead of remove() which is deprecated
    await College.deleteOne({ _id: college._id });
    
    res.json({ message: 'College and associated users removed' });
  } else {
    res.status(404);
    throw new Error('College not found');
  }
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
  reactivateSubscription,
  updatePaymentStatus,
  createCollegeWithAdmin: asyncHandler(async (req, res) => {
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

    console.log('Incoming createCollegeWithAdmin request:', { name, code, adminEmail });

    if (!name || !code || !email || !adminEmail || !adminPassword) {
      res.status(400);
      throw new Error('Missing required fields');
    }
    if (!validator.email(email) || !validator.email(adminEmail)) {
      res.status(400);
      throw new Error('Invalid email format');
    }

    // Check for duplicate college by name (case-insensitive) or code
    const existing = await College.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }, 
        { code: code.trim().toUpperCase() }
      ] 
    });
    
    if (existing) {
      console.log('College collision detected:', { 
        existingName: existing.name, 
        existingCode: existing.code,
        inputName: name,
        inputCode: code
      });
      res.status(409);
      const conflictField = existing.code === code.trim().toUpperCase() ? 'code' : 'name';
      throw new Error(`College already exists with this ${conflictField}: ${conflictField === 'code' ? existing.code : existing.name}`);
    }

    // Check for duplicate user by email
    const existingUser = await User.findOne({ email: adminEmail.trim().toLowerCase() });
    if (existingUser) {
      console.log('User collision detected:', adminEmail);
      res.status(409);
      throw new Error(`User with email ${adminEmail.trim()} already exists`);
    }

    const college = await College.create({
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
        paymentStatus: 'Paid'
      },
      features,
    });

    const adminUser = await User.create({
      name: adminName?.trim() || 'College Admin',
      email: adminEmail.trim().toLowerCase(),
      password: adminPassword,
      role: 'COLLEGE_ADMIN',
      college: college._id,
      mustChangePassword: true,
    });

    console.log('College and Admin created successfully:', college.name);

    try {
      await sendWelcomeEmail(adminUser.email, adminPassword, college.name);
    } catch (e) {
      console.error('Email sending failed during registration:', e.message);
      return res.status(201).json({
        college,
        adminId: adminUser._id,
        emailSent: false,
        message: 'College created but failed to send email',
      });
    }

    res.status(201).json({
      college,
      adminId: adminUser._id,
      emailSent: true,
    });
  }),
  resendCredentials: asyncHandler(async (req, res) => {
    const { adminEmail, collegeCode } = req.body;
    if (!adminEmail) {
      res.status(400);
      throw new Error('adminEmail is required');
    }
    if (!validator.email(adminEmail)) {
      res.status(400);
      throw new Error('Invalid email format');
    }

    const user = await User.findOne({ email: adminEmail.toLowerCase(), role: 'COLLEGE_ADMIN' }).populate('college');
    if (!user) {
      res.status(404);
      throw new Error('Admin user not found');
    }

    const tempPassword = Math.random().toString(36).slice(-10) + 'A!';
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    try {
      await sendWelcomeEmail(user.email, tempPassword, user.college ? user.college.name : collegeCode || 'Pulse College');
      res.json({ message: 'Credentials email sent' });
    } catch (e) {
      res.status(500);
      throw new Error('Failed to send email');
    }
  })
};
