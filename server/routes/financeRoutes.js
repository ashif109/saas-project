const express = require('express');
const router = express.Router();
const { 
    createTransaction, 
    getTransactions, 
    getFeeStructures, 
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    getFinanceStats 
} = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/transactions')
    .post(protect, createTransaction)
    .get(protect, getTransactions);

router.route('/fee-structures')
    .post(protect, createFeeStructure)
    .get(protect, getFeeStructures);

router.route('/fee-structures/:id')
    .put(protect, updateFeeStructure)
    .delete(protect, deleteFeeStructure);

router.get('/stats', protect, getFinanceStats);

module.exports = router;
