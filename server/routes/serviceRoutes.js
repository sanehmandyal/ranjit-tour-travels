import express from 'express';
import { getServices, getServiceBySlug, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:slug', getServiceBySlug);
router.post('/', protect, authorize('superadmin', 'admin'), createService);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateService);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteService);

export default router;
