const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
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
      console.log('Creating super@admin.com...');
      await User.create({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: 'SuperPassword123!',
        role: 'SUPER_ADMIN'
      });
      console.log('super@admin.com created!');
    }
    process.exit();
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();