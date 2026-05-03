const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const SystemSettings = require('../models/SystemSettings');
const { sendPasswordResetOtp } = require('../services/emailService');
const crypto = require('crypto');
const { createLog } = require('./logController');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password ? req.body.password.trim() : '';
  console.log('Login attempt for:', email);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { college: true }
  });

  if (!user) {
    console.log(`AUTH ERROR: User not found for email [${email}]`);
    await createLog({
      action: 'Login Failure',
      module: 'Auth',
      details: `Failed login attempt for email: ${email}`,
      userEmail: email,
      severity: 'Warning',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(`AUTH DEBUG: Password match for [${email}]:`, isMatch);

  if (isMatch) {
    // Fetch Settings for token expiry
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});
    const timeoutMinutes = parseInt(settings.sessionTimeout) || 60;

    await createLog({
      user: user.id,
      userName: user.name || `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      action: 'Login Success',
      module: 'Auth',
      details: `User logged in successfully`,
      severity: 'Info',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.json({
      _id: user.id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      college: user.college,
      token: generateToken({ 
        id: user.id, 
        role: user.role, 
        collegeId: user.collegeId || user.college?.id 
      }, timeoutMinutes),
    });
  } else {
    await createLog({
      user: user.id,
      userName: user.name || `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      action: 'Login Failure',
      module: 'Auth',
      details: `Incorrect password for user: ${email}`,
      severity: 'Warning',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user._id || req.user.id },
    include: { college: true }
  });

  if (user) {
    res.json({
      _id: user.id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      college: user.college,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user) {
    let hashedPassword = user.password;
    // If updating password, verify current password first
    if (req.body.password) {
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error('Current password is required to set a new password');
      }

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
      }

      // Validate Password Length from Settings
      let settings = await SystemSettings.findOne();
      if (!settings) settings = await SystemSettings.create({});
      const minLength = parseInt(settings.minPasswordLength) || 8;

      if (req.body.password.length < minLength) {
        res.status(400);
        throw new Error(`Password must be at least ${minLength} characters long`);
      }
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    const name = req.body.name || user.name;
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        firstName,
        lastName,
        email: req.body.email ? req.body.email.trim().toLowerCase() : user.email,
        avatar: req.body.avatar || user.avatar,
        phone: req.body.phone || user.phone,
        password: hashedPassword
      },
      include: { college: true }
    });

    await createLog({
      user: user.id,
      userName: updatedUser.name,
      userEmail: updatedUser.email,
      action: 'Profile Updated',
      module: 'Auth',
      details: `User updated their profile${req.body.password ? ' and password' : ''}`,
      severity: 'Info',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      college: updatedUser.college,
      token: generateToken({ 
        id: updatedUser.id, 
        role: updatedUser.role, 
        collegeId: updatedUser.collegeId || updatedUser.college?.id 
      }),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await createLog({
      action: 'Password Reset Request Failure',
      module: 'Auth',
      details: `Password reset requested for non-existent email: ${email}`,
      userEmail: email,
      severity: 'Warning',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.status(404);
    throw new Error('User not found');
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiry (10 mins)
  await prisma.user.update({
    where: { id: user.id },
    data: {
        resetPasswordOTP: otp,
        resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  console.log('Sending password reset OTP to:', email);
  try {
    await sendPasswordResetOtp(user.email, otp);
    console.log('Password reset OTP sent successfully to:', user.email);
    await createLog({
      user: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'Forgot Password Request',
      module: 'Auth',
      details: `OTP sent to ${user.email}`,
      severity: 'Info',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.json({ message: 'OTP sent to email' });
  } catch (emailError) {
    console.error('CRITICAL: Email Sending Failed (SMTP Error):', {
      message: emailError.message,
      stack: emailError.stack,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER
    });
    
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordOTP: null,
            resetPasswordExpires: null
        }
    });
    
    res.status(500);
    throw new Error(`Email service failed: ${emailError.message}. Check SMTP configuration.`);
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const { otp } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) {
    await createLog({
      action: 'OTP Verification Failure',
      module: 'Auth',
      details: `Invalid or expired OTP entered for: ${email}`,
      userEmail: email,
      severity: 'Warning',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  await createLog({
    user: user.id,
    userName: user.name,
    userEmail: user.email,
    action: 'OTP Verified',
    module: 'Auth',
    details: `User successfully verified OTP`,
    severity: 'Info',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  res.json({ message: 'OTP verified successfully' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const { otp, password } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Validate Password Length from Settings
  let settings = await SystemSettings.findOne();
  if (!settings) settings = await SystemSettings.create({});
  const minLength = parseInt(settings.minPasswordLength) || 8;

  if (password.length < minLength) {
    res.status(400);
    throw new Error(`Password must be at least ${minLength} characters long`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
        password: hashedPassword,
        resetPasswordOTP: null,
        resetPasswordExpires: null
    }
  });

  await createLog({
    user: user.id,
    userName: user.name,
    userEmail: user.email,
    action: 'Password Reset Success',
    module: 'Auth',
    details: `User successfully reset their password`,
    severity: 'Info',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  res.json({ message: 'Password reset successful' });
});

// @desc    Impersonate a user
// @route   POST /api/auth/impersonate/:userId
// @access  Private/SuperAdmin
const impersonateUser = asyncHandler(async (req, res) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: req.params.userId },
    include: { college: true }
  });

  if (!targetUser) {
    res.status(404);
    throw new Error('Target user not found');
  }

  // Log the impersonation
  await createLog({
    user: req.user._id || req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    action: 'Impersonation Started',
    module: 'Auth',
    details: `Super Admin impersonating ${targetUser.email} (${targetUser.role})`,
    severity: 'Warning',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    _id: targetUser.id,
    name: targetUser.name || `${targetUser.firstName} ${targetUser.lastName}`,
    email: targetUser.email,
    role: targetUser.role,
    avatar: targetUser.avatar,
    phone: targetUser.phone,
    college: targetUser.college,
    token: generateToken({ 
      id: targetUser.id, 
      role: targetUser.role, 
      collegeId: targetUser.collegeId || targetUser.college?.id 
    }),
    isImpersonating: true,
    originalAdminId: req.user._id || req.user.id
  });
});

const generateToken = (payload, expiresInMinutes) => {
  const expiresIn = expiresInMinutes ? `${expiresInMinutes}m` : '30d';
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = { login, getProfile, updateProfile, forgotPassword, verifyOTP, resetPassword, impersonateUser };
