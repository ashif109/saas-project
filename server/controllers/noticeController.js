const prisma = require('../config/prisma');

exports.createNotice = async (req, res) => {
  try {
    const { title, content, priority, audience, targetRoles, targetDepts } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(400).json({ message: "No college context found." });

    const newNotice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || "Standard",
        audience: audience || "Everyone",
        collegeId,
        targetRoles: targetRoles || [],
        targetDepts: targetDepts || []
      }
    });

    res.status(201).json({
      message: "Notice published successfully",
      notice: newNotice
    });

  } catch (error) {
    console.error('Create Notice Error:', error);
    res.status(500).json({ message: "Internal server error create notice" });
  }
};

exports.getNotices = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    if (!collegeId) return res.status(200).json([]);

    const notices = await prisma.notice.findMany({
      where: { collegeId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(notices);
  } catch (error) {
    console.error('Fetch Notices Error:', error);
    res.status(500).json({ message: "Internal server error fetching notices" });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    res.status(200).json({ message: "Notice removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};
