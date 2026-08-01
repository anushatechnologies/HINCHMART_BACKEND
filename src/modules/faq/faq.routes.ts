import { Router } from 'express';
import { getFaqs, getAllFaqsAdmin, createFaq, updateFaq, deleteFaq } from './faq.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', getFaqs);
router.get('/admin', requireAuth, getAllFaqsAdmin);
router.post('/admin', requireAuth, createFaq);
router.put('/admin/:id', requireAuth, updateFaq);
router.delete('/admin/:id', requireAuth, deleteFaq);

export default router;
