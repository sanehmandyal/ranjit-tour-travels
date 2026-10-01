import express from 'express';
import { login, register, getMe, updateMe, getUsers, updateUserRole, deleteUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('superadmin'), register);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/users', protect, authorize('superadmin'), getUsers);
router.put('/users/:id', protect, authorize('superadmin'), updateUserRole);
router.delete('/users/:id', protect, authorize('superadmin'), deleteUser);

export default router;
