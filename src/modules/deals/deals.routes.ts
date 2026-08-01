import { Router } from 'express';
import { getActiveDeals, getAllDealsAdmin, createDeal, updateDeal, deleteDeal } from './deals.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', getActiveDeals);
router.get('/admin', requireAuth, getAllDealsAdmin);
router.post('/admin', requireAuth, createDeal);
router.put('/admin/:id', requireAuth, updateDeal);
router.delete('/admin/:id', requireAuth, deleteDeal);

export default router;
