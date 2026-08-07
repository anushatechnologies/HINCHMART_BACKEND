"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const credit_lines_controller_1 = require("./credit-lines.controller");
const router = (0, express_1.Router)();
// Buyer Credit Endpoints
router.post('/apply', credit_lines_controller_1.applyCreditLine);
router.get('/status', credit_lines_controller_1.getCreditStatus);
// Admin Credit Desk Endpoints
router.get('/admin/applications', credit_lines_controller_1.getCreditLinesAdmin);
router.patch('/admin/:id/review', credit_lines_controller_1.reviewCreditLineAdmin);
exports.default = router;
//# sourceMappingURL=credit-lines.routes.js.map