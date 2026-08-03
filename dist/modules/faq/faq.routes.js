"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faq_controller_1 = require("./faq.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', faq_controller_1.getFaqs);
router.get('/admin', auth_1.requireAuth, faq_controller_1.getAllFaqsAdmin);
router.post('/admin', auth_1.requireAuth, faq_controller_1.createFaq);
router.put('/admin/:id', auth_1.requireAuth, faq_controller_1.updateFaq);
router.delete('/admin/:id', auth_1.requireAuth, faq_controller_1.deleteFaq);
exports.default = router;
//# sourceMappingURL=faq.routes.js.map