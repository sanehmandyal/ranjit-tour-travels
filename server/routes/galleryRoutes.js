import express from 'express';
import { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGallery);
router.post('/', protect, authorize('superadmin', 'admin', 'editor'), createGalleryItem);
router.put('/:id', protect, authorize('superadmin', 'admin', 'editor'), updateGalleryItem);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'editor'), deleteGalleryItem);

export default router;
