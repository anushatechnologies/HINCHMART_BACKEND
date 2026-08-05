import { Router } from 'express';
import { getSettlements, paySettlement } from './settlements.controller';
import { getEscrowLedger, releaseEligibleEscrow, generateTdsReport } from './escrow-payout.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Standard Settlements (Legacy)
router.get('/', requireAuth, getSettlements);
router.patch('/:id/pay', requireAuth, paySettlement);

// Phase 13: Escrow & Tax Engine
router.get('/escrow', requireAuth, getEscrowLedger);
router.post('/admin/escrow/release', requireAuth, releaseEligibleEscrow);
router.get('/admin/tax/tds-report', requireAuth, generateTdsReport);

export default router;
