import { Router } from 'express';
import { getTestimonials, getBlogs, getActiveDeals, getPageContent, updatePageContent, getPrivacyPolicy } from './content.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/testimonials', getTestimonials);
router.get('/blogs', getBlogs);
router.get('/deals', getActiveDeals);
router.get('/privacy-policy', getPrivacyPolicy);

// Legal & Corporate Pages
router.get('/pages/:slug', getPageContent);
router.put('/pages/:slug', requireAuth, updatePageContent); // Admin only

export default router;
