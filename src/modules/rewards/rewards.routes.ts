import { Router } from 'express';
import { getRewards, earnPoints } from './rewards.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', requireAuth, getRewards);
router.post('/earn', requireAuth, earnPoints);

export default router;
