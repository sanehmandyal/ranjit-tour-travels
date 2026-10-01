import express from 'express';
import { getCoupons, createCoupon, validateCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('superadmin', 'admin'), getCoupons);
router.post('/', protect, authorize('superadmin', 'admin'), createCoupon);
router.post('/validate', validateCoupon); // Public validate endpoint
router.put('/:id', protect, authorize('superadmin', 'admin'), updateCoupon);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteCoupon);

export default router;
