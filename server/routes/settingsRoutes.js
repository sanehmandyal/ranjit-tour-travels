import express from 'express';
import { getSettings, updateSettings, getSEOSettings, updateSEOSettings, triggerSeedSync } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorize('superadmin', 'admin'), updateSettings);
router.get('/seo', getSEOSettings);
router.put('/seo', protect, authorize('superadmin', 'admin'), updateSEOSettings);
router.all('/seed-sync', triggerSeedSync);

export default router;

