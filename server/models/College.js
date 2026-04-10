const mongoose = require('mongoose');

const collegeSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a college name'],
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Please add a college code'],
    unique: true,
    uppercase: true
  },
  email: {
    type: String,
    required: [true, 'Please add a primary email']
  },
  website: String,
  logoUrl: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  country: {
    type: String,
    default: 'India'
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Basic', 'Premium', 'Enterprise'],
      default: 'Basic'
    },
    status: {
      type: String,
      enum: ['Active', 'Expiring Soon', 'Expired', 'Cancelled', 'Disabled'],
      default: 'Active'
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Paid'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    lastPaymentDate: Date,
    nextBillingDate: Date,
    history: [{
      action: String, // extended, upgraded, cancelled, payment
      date: { type: Date, default: Date.now },
      previousPlan: String,
      newPlan: String,
      paymentStatus: String,
      message: String
    }]
  },
  features: {
    doubtSystem: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true }
  },
  limits: {
    students: { type: Number, default: 5000 },
    faculty: { type: Number, default: 250 }
  },
  stats: {
    students: { type: Number, default: 0 },
    faculty: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);
