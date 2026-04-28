const prisma = require('../config/prisma');

exports.createTransaction = async (req, res) => {
  try {
    const { amount, studentId, feeStructureId, paymentMethod, type, status } = req.body;

    if (!amount || !studentId) {
      return res.status(400).json({ message: "Amount and student ID are required." });
    }

    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        studentId,
        feeStructureId: feeStructureId || null,
        paymentMethod: paymentMethod || "Cash",
        type: type || "Tuition",
        status: status || "PAID",
        collegeId,
        receiptNo: `REC${Date.now().toString().slice(-8)}`
      },
      include: {
        student: { include: { user: true } },
        feeStructure: true
      }
    });

    res.status(201).json({
      message: "Payment entry recorded",
      transaction
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({ message: "Failed to record payment" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    let collegeId = req.user?.college || req.user?.collegeId;
    if (!collegeId) {
      const firstCollege = await prisma.college.findFirst();
      collegeId = firstCollege?.id;
    }

    const transactions = await prisma.transaction.findMany({
      where: { collegeId },
      include: {
        student: { include: { user: true } },
        feeStructure: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Fetch Transactions Error:', error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

exports.getFeeStructures = async (req, res) => {
    try {
        let collegeId = req.user?.college || req.user?.collegeId;
        if (!collegeId) {
            const firstCollege = await prisma.college.findFirst();
            collegeId = firstCollege?.id;
        }

        const structures = await prisma.feeStructure.findMany({
            where: { collegeId },
            include: { course: true }
        });
        res.status(200).json(structures);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch structures" });
    }
};

exports.createFeeStructure = async (req, res) => {
    try {
        const { name, amount, courseId, description } = req.body;
        let collegeId = req.user?.college || req.user?.collegeId;
        if (!collegeId) {
            const firstCollege = await prisma.college.findFirst();
            collegeId = firstCollege?.id;
        }

        const structure = await prisma.feeStructure.create({
            data: { name, amount: parseFloat(amount), courseId, description, collegeId }
        });
        res.status(201).json(structure);
    } catch (error) {
        res.status(500).json({ message: "Failed to create fee structure" });
    }
};

exports.getFinanceStats = async (req, res) => {
    try {
        let collegeId = req.user?.college || req.user?.collegeId;
        if (!collegeId) {
            const firstCollege = await prisma.college.findFirst();
            collegeId = firstCollege?.id;
        }

        const transactions = await prisma.transaction.findMany({
            where: { collegeId, status: 'PAID' }
        });

        const totalCollection = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        
        // Mock pending for now based on total students - transactions
        const totalStudents = await prisma.studentProfile.count({ where: { user: { collegeId } } });

        res.status(200).json({
            totalCollection,
            pendingDues: 42500, // Placeholder or calculated if we have a debt model
            activeStudents: totalStudents
        });
    } catch (error) {
        res.status(500).json({ message: "Stats error" });
    }
}
