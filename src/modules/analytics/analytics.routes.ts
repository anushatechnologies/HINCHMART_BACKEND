import { Router } from 'express';
import { getDashboardStats } from './analytics.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/dashboard', requireAuth, getDashboardStats);

export default router;
