import express from 'express';
import { getPackages, getPackageBySlug, createPackage, updatePackage, deletePackage } from '../controllers/packageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPackages);
router.get('/:slug', getPackageBySlug);
router.post('/', protect, authorize('superadmin', 'admin'), createPackage);
router.put('/:id', protect, authorize('superadmin', 'admin'), updatePackage);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deletePackage);

export default router;
