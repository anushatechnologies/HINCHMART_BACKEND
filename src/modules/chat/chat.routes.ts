import { Router } from 'express';
import { startSession, getSession, sendMessage, getAllSessionsAdmin, closeSession } from './chat.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Public / Customer
router.post('/start', startSession);
router.get('/:id', getSession);
router.post('/:id/message', sendMessage);

// Admin
router.get('/admin/all', requireAuth, getAllSessionsAdmin);
router.post('/admin/:id/close', requireAuth, closeSession);

export default router;
