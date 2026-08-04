import { Router } from 'express';
import { getAuditLogs } from './audit.controller';
import { requireAdmin } from '../../middlewares/auth';

const router = Router();

router.get('/audit-logs', requireAdmin, getAuditLogs);

export default router;
