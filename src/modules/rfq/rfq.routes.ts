import { Router } from 'express';
import { createRfq, getRfqs, createQuote, getMyRfqs, getRfqDetails, getRfqMessages } from './rfq.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.post('/', authenticate, createRfq);
router.get('/', getRfqs); // Admin gets all RFQs
router.get('/my', authenticate, getMyRfqs); // Buyer gets their RFQs
router.get('/:id', authenticate, getRfqDetails);
router.get('/:id/messages', authenticate, getRfqMessages);
router.post('/:id/quote', createQuote); // Admin creates quote

export default router;
