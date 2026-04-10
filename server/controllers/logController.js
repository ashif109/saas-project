const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/logs
// @access  Private/SuperAdmin
const getLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber) || 1;
  const isExport = req.query.export === 'true';
  const pageSize = isExport ? 10000 : (Number(req.query.pageSize) || 50);

  let query = {};

  // Keyword search
  if (req.query.keyword) {
    const searchRegex = { $regex: req.query.keyword, $options: 'i' };
    query.$or = [
      { userName: searchRegex },
      { userEmail: searchRegex },
      { action: searchRegex },
      { module: searchRegex },
      { details: searchRegex }
    ];
  }

  // Severity filter
  if (req.query.severity && req.query.severity !== 'All') {
    query.severity = req.query.severity;
  } else if (req.query.securityOnly === 'true') {
    query.severity = { $in: ['Warning', 'Critical'] };
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      const start = new Date(req.query.startDate);
      start.setHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (req.query.endDate) {
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const count = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(isExport ? 0 : (pageSize * (page - 1)));

  res.json({ 
    logs, 
    page, 
    pages: isExport ? 1 : Math.ceil(count / pageSize), 
    total: count 
  });
});

// @desc    Create an audit log
// @access  Internal Helper
const createLog = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// @desc    Clear old logs
// @route   DELETE /api/logs
// @access  Private/SuperAdmin
const clearLogs = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days) : 30;
  
  let query = {};
  if (days > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    query = { createdAt: { $lt: cutoffDate } };
  }
  
  const result = await AuditLog.deleteMany(query);
  res.json({ 
    message: days === 0 ? 'All logs cleared successfully' : `Logs older than ${days} days cleared successfully`,
    deletedCount: result.deletedCount 
  });
});

module.exports = {
  getLogs,
  createLog,
  clearLogs
};