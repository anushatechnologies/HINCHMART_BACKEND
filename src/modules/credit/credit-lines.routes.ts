import { Router } from 'express';
import { applyCreditLine, getCreditStatus, getCreditLinesAdmin, reviewCreditLineAdmin } from './credit-lines.controller';

const router = Router();

// Buyer Credit Endpoints
router.post('/apply', applyCreditLine);
router.get('/status', getCreditStatus);

// Admin Credit Desk Endpoints
router.get('/admin/applications', getCreditLinesAdmin);
router.patch('/admin/:id/review', reviewCreditLineAdmin);

export default router;
