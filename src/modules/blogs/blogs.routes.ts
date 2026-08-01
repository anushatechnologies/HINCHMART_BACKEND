import { Router } from 'express';
import { getBlogs, getBlogBySlug, getAllBlogsAdmin, createBlog, updateBlog, deleteBlog } from './blogs.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Public
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin
router.get('/admin/all', requireAuth, getAllBlogsAdmin);
router.post('/admin', requireAuth, createBlog);
router.put('/admin/:id', requireAuth, updateBlog);
router.delete('/admin/:id', requireAuth, deleteBlog);

export default router;
