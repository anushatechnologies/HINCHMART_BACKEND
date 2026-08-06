import { Router } from 'express';
import { createRfq, getRfqs, createQuote, getMyRfqs, getRfqDetails, getRfqMessages } from './rfq.controller';
import { authenticate, optionalAuth } from '../../middlewares/auth';

const router = Router();

router.post('/', optionalAuth, createRfq);
router.get('/', getRfqs); // Admin gets all RFQs
router.get('/my', optionalAuth, getMyRfqs); // Buyer gets their RFQs
router.get('/:id', optionalAuth, getRfqDetails);
router.get('/:id/messages', optionalAuth, getRfqMessages);
router.post('/:id/quote', createQuote); // Admin creates quote

export default router;
