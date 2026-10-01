import express from 'express';
import { getDestinations, getDestinationBySlug, createDestination, updateDestination, deleteDestination } from '../controllers/destinationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);
router.post('/', protect, authorize('superadmin', 'admin'), createDestination);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateDestination);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteDestination);

export default router;
