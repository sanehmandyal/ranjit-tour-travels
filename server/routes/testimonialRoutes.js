import express from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTestimonials);
router.post('/', protect, authorize('superadmin', 'admin', 'editor'), createTestimonial);
router.put('/:id', protect, authorize('superadmin', 'admin', 'editor'), updateTestimonial);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'editor'), deleteTestimonial);

export default router;
