const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');

async function test() {
  const email = 'michealasif41@gmail.com';
  const password = 'Faculty@123';
  
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User found:', user.email);
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);
}
test().catch(console.error).finally(() => process.exit(0));
