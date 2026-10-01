import express from 'express';
import { getCustomers, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('superadmin', 'admin'), getCustomers);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateCustomer);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteCustomer);

export default router;
