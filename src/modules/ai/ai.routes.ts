import { Router } from 'express';
import { chatWithCopilot } from './ai.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.post('/chat', requireAuth, chatWithCopilot);

export default router;
