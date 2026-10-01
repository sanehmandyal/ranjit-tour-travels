import express from 'express';
import { getSettings, updateSettings, getSEOSettings, updateSEOSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorize('superadmin', 'admin'), updateSettings);
router.get('/seo', getSEOSettings);
router.put('/seo', protect, authorize('superadmin', 'admin'), updateSEOSettings);

export default router;
