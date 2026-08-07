"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settlements_controller_1 = require("./settlements.controller");
const escrow_payout_controller_1 = require("./escrow-payout.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Standard Settlements (Legacy)
router.get('/', auth_1.requireAuth, settlements_controller_1.getSettlements);
router.patch('/:id/pay', auth_1.requireAuth, settlements_controller_1.paySettlement);
// Phase 13: Escrow & Tax Engine
router.get('/escrow', auth_1.requireAuth, escrow_payout_controller_1.getEscrowLedger);
router.post('/admin/escrow/release', auth_1.requireAuth, escrow_payout_controller_1.releaseEligibleEscrow);
router.get('/admin/tax/tds-report', auth_1.requireAuth, escrow_payout_controller_1.generateTdsReport);
exports.default = router;
//# sourceMappingURL=settlements.routes.js.map