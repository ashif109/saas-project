const prisma = require('./config/prisma');

async function testSync() {
  console.log('--- Faculty Sync Test ---');
  
  // 1. Check User with email michealasif41@gmail.com (example from previous tests)
  const email = 'michealasif41@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { facultyProfile: true }
  });

  if (!user) {
    console.log('FAIL: User not found');
    return;
  }

  console.log('SUCCESS: Found User:', user.id);
  console.log('Role:', user.role);
  console.log('College ID (from DB):', user.collegeId);

  if (!user.facultyProfile) {
    console.log('FAIL: Faculty profile NOT FOUND for this user');
  } else {
    console.log('SUCCESS: Found Faculty Profile:', user.facultyProfile.id);
    
    // 2. Check Timetable for this Faculty
    const entries = await prisma.timetableEntry.findMany({
      where: { facultyId: user.facultyProfile.id },
      include: { batch: true, subject: true }
    });

    console.log(`SUCCESS: Found ${entries.length} timetable entries`);
    entries.forEach(e => {
        console.log(`- Day: ${e.dayOfWeek}, Batch: ${e.batch?.name}, Subject: ${e.subject?.name}`);
    });

    if (entries.length > 0) {
        // 3. Check Students for one of the batches
        const batchId = entries[0].batchId;
        const students = await prisma.user.findMany({
            where: { studentProfile: { batchId } },
            include: { studentProfile: true }
        });
        console.log(`SUCCESS: Found ${students.length} students in batch ${entries[0].batch?.name}`);
    }
  }
}

testSync()
  .catch(console.error)
  .finally(() => process.exit(0));
