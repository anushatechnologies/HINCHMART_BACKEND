import { Router } from 'express';
import { chatWithCopilot, getAIRecommendations } from './ai.controller';
import { requireAuth, optionalAuth } from '../../middlewares/auth';

const router = Router();

router.post('/chat', requireAuth, chatWithCopilot);
router.get('/recommendations', optionalAuth, getAIRecommendations);

export default router;
