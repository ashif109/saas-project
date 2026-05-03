const prisma = require('./config/prisma');

async function test() {
  const email = 'michealasif41@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { facultyProfile: true }
  });

  if (!user || !user.facultyProfile) {
    console.log('User or faculty profile not found');
    return;
  }

  const collegeId = user.collegeId;
  const facultyId = user.facultyProfile.id;

  console.log('Searching for entries with facultyId:', facultyId);

  const entries = await prisma.timetableEntry.findMany({
    where: { facultyId },
    include: {
      batch: true,
      subject: true
    }
  });

  console.log('Found entries:', entries.length);
  entries.forEach(e => {
    console.log(`- Day: ${e.dayOfWeek}, Time: ${e.startTime}-${e.endTime}, Subject: ${e.subject?.name}`);
  });
}
test().catch(console.error).finally(() => process.exit(0));
