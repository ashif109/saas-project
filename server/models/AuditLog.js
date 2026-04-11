const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: String,
  userEmail: String,
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  severity: {
    type: String,
    enum: ['Info', 'Warning', 'Critical'],
    default: 'Info'
  }
}, {
  timestamps: true
});

// Optimized Indexes for log searching
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ user: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);