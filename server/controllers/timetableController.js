const prisma = require('../config/prisma');

exports.createTimetableEntry = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, roomInfo, batchId, facultyId, subjectId } = req.body;

    if (!dayOfWeek || !startTime || !endTime || !batchId || !facultyId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newEntry = await prisma.timetableEntry.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        roomInfo,
        batchId,
        facultyId,
        subjectId
      },
      include: {
        batch: true,
        faculty: { include: { user: true } },
        subject: true
      }
    });

    res.status(201).json({
      message: "Timetable entry created",
      entry: newEntry
    });
  } catch (error) {
    console.error('Create Timetable Error:', error);
    res.status(500).json({ message: "Failed to create timetable entry" });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const { batchId } = req.query;
    
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const where = {};
    if (batchId) {
      where.batchId = batchId;
    } else {
      where.batch = { collegeId };
    }

    if (req.user?.role === 'FACULTY') {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { facultyProfile: true }
      });
      if (user?.facultyProfile) {
        where.facultyId = user.facultyProfile.id;
      }
    }

    const entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        batch: true,
        faculty: { 
            include: { 
                user: true,
                department: true
            } 
        },
        subject: true
      }
    });

    res.status(200).json(entries);
  } catch (error) {
    console.error('Fetch Timetable Error:', error);
    res.status(500).json({ message: "Failed to fetch timetable" });
  }
};

exports.deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.timetableEntry.delete({ where: { id } });
    res.status(200).json({ message: "Entry removed" });
  } catch (error) {
    console.error('Delete Timetable Error:', error);
    res.status(500).json({ message: "Failed to delete entry" });
  }
};

exports.getTimetableMetadata = async (req, res) => {
    try {
        let collegeId = req.user?.college || req.user?.collegeId;
        if (!collegeId) {
            const firstCollege = await prisma.college.findFirst();
            collegeId = firstCollege?.id;
        }

        const [batches, faculties, subjects] = await Promise.all([
            prisma.batch.findMany({ where: { collegeId }, include: { course: true } }),
            prisma.facultyProfile.findMany({ 
                where: { user: { collegeId } },
                include: { user: true, department: true }
            }),
            prisma.subject.findMany({ 
                where: { course: { department: { collegeId } } }
            })
        ]);

        res.status(200).json({ batches, faculties, subjects });
    } catch (error) {
        console.error('Metadata Fetch Error:', error);
        res.status(500).json({ message: "Failed to load setup data" });
    }
}
