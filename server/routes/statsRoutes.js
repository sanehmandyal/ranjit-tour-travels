import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('superadmin', 'admin'), getDashboardStats);

export default router;
