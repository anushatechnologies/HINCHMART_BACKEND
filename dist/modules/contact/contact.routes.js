"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("./contact.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/', contact_controller_1.submitInquiry);
router.get('/admin', auth_1.requireAuth, contact_controller_1.getInquiries);
router.patch('/admin/:id/status', auth_1.requireAuth, contact_controller_1.updateInquiryStatus);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map