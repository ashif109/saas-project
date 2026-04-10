const express = require('express');
const router = express.Router();
const { 
  registerCollege, 
  getColleges, 
  getCollegeById, 
  getCollegeAdmin,
  updateCollegeStatus,
  deleteCollege,
  extendSubscription,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  updatePaymentStatus,
  createCollegeWithAdmin,
  resendCredentials
} = require('../controllers/collegeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(registerCollege)
  .get(getColleges);

router.post('/create', createCollegeWithAdmin);
router.post('/resend-credentials', resendCredentials);

router.route('/:id')
  .get(protect, getCollegeById)
  .delete(protect, authorize('SUPER_ADMIN'), deleteCollege);

router.get('/:id/admin', protect, authorize('SUPER_ADMIN'), getCollegeAdmin);

router.route('/:id/status')
  .put(updateCollegeStatus);

router.route('/:id/extend')
  .post(extendSubscription);

router.route('/:id/change-plan')
  .post(changePlan);

router.route('/:id/cancel')
  .post(cancelSubscription);

router.route('/:id/reactivate')
  .post(reactivateSubscription);

router.route('/:id/payment')
  .post(updatePaymentStatus);

module.exports = router;
