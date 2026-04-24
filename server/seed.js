const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const College = require('./models/College');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedSuperAdmin = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Searching for Pulse Admin...');
    const existingPulseAdmin = await User.findOne({ email: 'admin@pulsedesk.com' });
    if (!existingPulseAdmin) {
      console.log('Creating admin@pulsedesk.com...');
      await User.create({
        name: 'Pulse Admin',
        email: 'admin@pulsedesk.com',
        password: 'SuperPassword123!',
        role: 'SUPER_ADMIN'
      });
      console.log('admin@pulsedesk.com created!');
    } else {
      console.log('Updating admin@pulsedesk.com password...');
      existingPulseAdmin.password = 'SuperPassword123!';
      await existingPulseAdmin.save();
      console.log('admin@pulsedesk.com password updated!');
    }

    console.log('Searching for super@admin.com...');
    const existingAdmin = await User.findOne({ email: 'super@admin.com' });
    if (existingAdmin) {
      console.log('Updating super@admin.com password...');
      existingAdmin.password = 'SuperPassword123!';
      await existingAdmin.save();
      console.log('super@admin.com password updated!');
    } else {
      await User.create({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: 'SuperPassword123!',
        role: 'SUPER_ADMIN'
      });
      console.log('super@admin.com created!');
    }

    console.log('Searching for Test College...');
    let college = await College.findOne({ subdomain: 'testcollege' });
    if (!college) {
      console.log('Creating Test College...');
      college = await College.create({
        name: 'PulseDesk University',
        subdomain: 'testcollege',
        email: 'info@testcollege.com',
        code: 'TEST01',
        status: 'Active'
      });
      console.log('Test College created!');
    }

    console.log('Searching for collegeadmin@pulsedesk.com...');
    const existingCollegeAdmin = await User.findOne({ email: 'college@admin.com' });
    if (!existingCollegeAdmin) {
      console.log('Creating college@admin.com...');
      await User.create({
        name: 'College Director',
        email: 'college@admin.com',
        password: 'CollegePassword123!',
        role: 'COLLEGE_ADMIN',
        college: college._id
      });
      console.log('college@admin.com created!');
    } else {
      console.log('Updating college@admin.com password...');
      existingCollegeAdmin.password = 'CollegePassword123!';
      existingCollegeAdmin.college = college._id;
      await existingCollegeAdmin.save();
      console.log('college@admin.com password updated!');
    }
    process.exit();
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();