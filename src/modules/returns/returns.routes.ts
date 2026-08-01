import { Router } from 'express';
import { initiateReturn, getReturnRequests, updateReturnStatus } from './returns.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Customer
router.post('/initiate', requireAuth, initiateReturn);

// Admin / Vendor
router.get('/admin', requireAuth, getReturnRequests);
router.patch('/admin/:id/status', requireAuth, updateReturnStatus);

export default router;
