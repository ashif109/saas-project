const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'FACULTY', 'STUDENT'],
    default: 'STUDENT'
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: function() {
      return this.role !== 'SUPER_ADMIN';
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  resetPasswordOTP: {
    type: String,
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
