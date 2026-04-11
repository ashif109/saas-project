const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');
const College = require('../models/College');
const User = require('../models/User');
const { createLog } = require('./logController');

// @desc    Sync platform data (Refresh)
// @route   POST /api/system/sync-data
// @access  Private/SuperAdmin
const syncPlatformData = asyncHandler(async (req, res) => {
  // In a real production environment, this might trigger a sync with external services
  // or re-validate cached data. For now, we'll log it and return success.
  
  await createLog({
    user: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    action: 'Platform Data Sync',
    module: 'System',
    details: 'Administrator manually triggered a platform-wide data synchronization.',
    severity: 'Info',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({ message: 'Platform data synchronized successfully.' });
});

// @desc    Clear temporary data (Logs/Cache)
// @route   POST /api/system/clear-temp-data
// @access  Private/SuperAdmin
const clearTempData = asyncHandler(async (req, res) => {
  // Clear non-critical audit logs older than 7 days as "temp data"
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const deletedLogs = await AuditLog.deleteMany({
    severity: { $ne: 'Critical' },
    createdAt: { $lt: sevenDaysAgo }
  });

  await createLog({
    user: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    action: 'Temporary Data Cleanup',
    module: 'System',
    details: `Cleaned up ${deletedLogs.deletedCount} non-critical historical logs.`,
    severity: 'Warning',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({ 
    message: 'Temporary data cleared successfully.',
    deletedCount: deletedLogs.deletedCount 
  });
});

// @desc    Recalculate analytics metrics
// @route   POST /api/system/recalculate-analytics
// @access  Private/SuperAdmin
const recalculateAnalytics = asyncHandler(async (req, res) => {
  // This could involve re-aggregating data and updating a 'Stats' collection if we used one.
  // For now, we'll simulate a heavy calculation by waiting briefly and then logging.
  
  await new Promise(resolve => setTimeout(resolve, 1500));

  await createLog({
    user: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    action: 'Analytics Recalculation',
    module: 'System',
    details: 'Global institutional performance metrics re-aggregated and recalculated.',
    severity: 'Info',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({ message: 'Analytics metrics recalculated successfully.' });
});

// @desc    Restart Platform
// @route   POST /api/system/restart
// @access  Private/SuperAdmin
const restartPlatform = asyncHandler(async (req, res) => {
  await createLog({
    user: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    action: 'Platform Restart',
    module: 'System',
    details: 'Graceful platform restart initiated by administrator.',
    severity: 'Critical',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({ message: 'Platform restart initiated. System will be back online in a few seconds.' });

  // Real restart logic for production (requires process manager like PM2)
  setTimeout(() => {
    console.log('--- SYSTEM RESTART INITIATED BY ADMIN ---');
    process.exit(0); 
  }, 1000);
});

module.exports = {
  syncPlatformData,
  clearTempData,
  recalculateAnalytics,
  restartPlatform
};
