const mongoose = require('mongoose');

const systemSettingsSchema = mongoose.Schema({
  // Platform Configuration
  studentLimit: { type: String, default: '5000' },
  facultyLimit: { type: String, default: '250' },
  defaultPlan: { type: String, default: 'Basic' },
  autoApproval: { type: Boolean, default: false },

  // Authentication Settings
  forcePasswordReset: { type: Boolean, default: true },
  minPasswordLength: { type: String, default: '10' },
  sessionTimeout: { type: String, default: '60' },

  // Email & Notifications
  sendWelcomeEmail: { type: Boolean, default: true },
  sendCredentials: { type: Boolean, default: true },
  systemAlerts: { type: Boolean, default: true },

  // Feature Control (Global)
  globalDoubtSystem: { type: Boolean, default: true },
  globalAttendance: { type: Boolean, default: true },
  globalAnalytics: { type: Boolean, default: true },

  // College Rules
  maxColleges: { type: String, default: '50' },
  duplicateNameRestriction: { type: Boolean, default: true },
  approvalRequirement: { type: Boolean, default: true },

  // Alert Settings
  lowActivityThreshold: { type: String, default: '15' },
  inactiveDaysAlert: { type: String, default: '30' },

  // Backup Settings
  autoBackup: { type: Boolean, default: true },
  backupFrequency: { type: String, default: 'Daily' },
  lastBackup: { type: String, default: function() { return new Date().toLocaleString(); } },

  // Branding
  platformName: { type: String, default: 'PulseDesk' },
  themeColor: { type: String, default: '#14b8a6' },
  logoUrl: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
