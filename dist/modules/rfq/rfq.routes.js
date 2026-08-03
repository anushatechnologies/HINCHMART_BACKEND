"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rfq_controller_1 = require("./rfq.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, rfq_controller_1.createRfq);
router.get('/', rfq_controller_1.getRfqs); // Admin gets all RFQs
router.get('/my', auth_1.authenticate, rfq_controller_1.getMyRfqs); // Buyer gets their RFQs
router.get('/:id', auth_1.authenticate, rfq_controller_1.getRfqDetails);
router.get('/:id/messages', auth_1.authenticate, rfq_controller_1.getRfqMessages);
router.post('/:id/quote', rfq_controller_1.createQuote); // Admin creates quote
exports.default = router;
//# sourceMappingURL=rfq.routes.js.map