import { Router } from 'express';
import { getSettlements, paySettlement } from './settlements.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', requireAuth, getSettlements);
router.patch('/:id/pay', requireAuth, paySettlement);

export default router;
