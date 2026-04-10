const asyncHandler = require('express-async-handler');
const SystemSettings = require('../models/SystemSettings');
const { createLog } = require('./logController');

// @desc    Get system settings
// @route   GET /api/settings/system
// @access  Private/SuperAdmin
const getSystemSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSettings.findOne();
  
  // Create default settings if they don't exist
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  
  res.json(settings);
});

// @desc    Update system settings
// @route   PUT /api/settings/system
// @access  Private/SuperAdmin
const updateSystemSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSettings.findOne();
  
  if (settings) {
    // Update existing settings
    Object.assign(settings, req.body);
    const updatedSettings = await settings.save();
    
    await createLog({
      user: req.user?._id,
      userName: req.user?.name || 'Unknown',
      userEmail: req.user?.email || 'Unknown',
      action: 'System Settings Updated',
      module: 'Settings',
      details: `Global system settings updated by ${req.user?.name || 'Unknown User'}`,
      severity: 'Warning',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(updatedSettings);
  } else {
    // Create new settings if not found (fallback)
    const newSettings = await SystemSettings.create(req.body);
    
    await createLog({
      user: req.user?._id,
      userName: req.user?.name || 'Unknown',
      userEmail: req.user?.email || 'Unknown',
      action: 'System Settings Created',
      module: 'Settings',
      details: `Global system settings initialized by ${req.user?.name || 'Unknown User'}`,
      severity: 'Warning',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(newSettings);
  }
});

module.exports = {
  getSystemSettings,
  updateSystemSettings
};
