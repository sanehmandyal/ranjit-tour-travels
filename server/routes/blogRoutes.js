import express from 'express';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, authorize('superadmin', 'admin', 'editor'), createBlog);
router.put('/:id', protect, authorize('superadmin', 'admin', 'editor'), updateBlog);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'editor'), deleteBlog);

export default router;
