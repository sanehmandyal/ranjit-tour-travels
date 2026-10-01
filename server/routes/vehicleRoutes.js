import express from 'express';
import { getVehicles, getVehicleBySlug, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/:slug', getVehicleBySlug);
router.post('/', protect, authorize('superadmin', 'admin'), createVehicle);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateVehicle);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteVehicle);

export default router;
