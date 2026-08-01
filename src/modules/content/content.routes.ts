import { Router } from 'express';
import { getTestimonials, getBlogs, getActiveDeals, getPageContent, updatePageContent } from './content.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/testimonials', getTestimonials);
router.get('/blogs', getBlogs);
router.get('/deals', getActiveDeals);

// Legal & Corporate Pages
router.get('/pages/:slug', getPageContent);
router.put('/pages/:slug', requireAuth, updatePageContent); // Admin only

export default router;
