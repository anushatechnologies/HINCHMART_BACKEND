import { Router } from 'express';
import { getWallet, addFunds } from './wallet.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', requireAuth, getWallet);
router.post('/add-funds', requireAuth, addFunds);

export default router;
