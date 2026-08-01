import { Router } from 'express';
import {
  getBuyingGuides, getBuyingGuideBySlug, getAllGuidesAdmin,
  createBuyingGuide, updateBuyingGuide, deleteBuyingGuide
} from './buying-guides.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', getBuyingGuides);
router.get('/admin/all', requireAuth, getAllGuidesAdmin);
router.post('/admin', requireAuth, createBuyingGuide);
router.put('/admin/:id', requireAuth, updateBuyingGuide);
router.delete('/admin/:id', requireAuth, deleteBuyingGuide);
router.get('/:slug', getBuyingGuideBySlug);

export default router;
