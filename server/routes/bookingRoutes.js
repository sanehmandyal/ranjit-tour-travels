import express from 'express';
import { getBookings, getBookingById, createBooking, updateBooking, deleteBooking } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('superadmin', 'admin'), getBookings);
router.get('/:id', getBookingById); // Public lookup by booking ID with limited customer info, or admin
router.post('/', createBooking); // Public booking endpoint
router.put('/:id', protect, authorize('superadmin', 'admin'), updateBooking);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteBooking);

export default router;
