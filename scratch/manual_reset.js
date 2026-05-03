const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const url = 'mongodb+srv://ashifansari04704_db_user:FGOy4yvYAssx1qVI@clusterpulse0.g1dsmnh.mongodb.net/pulsedesk?appName=ClusterPulse0';

async function run() {
  try {
    const conn = await mongoose.createConnection(url).asPromise();
    const hash = await bcrypt.hash('Faculty@123', 10);
    const result = await conn.db.collection('User').updateOne(
      { email: 'ansariasif5413@gmail.com' },
      { $set: { password: hash } }
    );
    console.log('Update Result:', result);
    await conn.close();
  } catch (err) {
    console.error(err);
  }
}
run();
