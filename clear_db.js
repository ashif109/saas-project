const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const collegeRes = await db.collection('colleges').deleteMany({});
    console.log(`Deleted ${collegeRes.deletedCount} colleges`);
    
    const userRes = await db.collection('users').deleteMany({ role: { $ne: 'SUPER_ADMIN' } });
    console.log(`Deleted ${userRes.deletedCount} users (non-super-admins)`);
    
    console.log('DATABASE_CLEANUP_SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err.message);
    process.exit(1);
  }
}

clearDB();
