import express from 'express';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', createReview); // Public submission for moderation
router.put('/:id', protect, authorize('superadmin', 'admin'), updateReview);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteReview);

export default router;
