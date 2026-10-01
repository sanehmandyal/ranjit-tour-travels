import express from 'express';
import { getInquiries, createInquiry, updateInquiry, deleteInquiry } from '../controllers/inquiryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('superadmin', 'admin'), getInquiries);
router.post('/', createInquiry); // Public inquiry endpoint
router.put('/:id', protect, authorize('superadmin', 'admin'), updateInquiry);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteInquiry);

export default router;
