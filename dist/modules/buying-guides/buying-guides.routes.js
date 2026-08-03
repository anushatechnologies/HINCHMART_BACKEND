"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const buying_guides_controller_1 = require("./buying-guides.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', buying_guides_controller_1.getBuyingGuides);
router.get('/admin/all', auth_1.requireAuth, buying_guides_controller_1.getAllGuidesAdmin);
router.post('/admin', auth_1.requireAuth, buying_guides_controller_1.createBuyingGuide);
router.put('/admin/:id', auth_1.requireAuth, buying_guides_controller_1.updateBuyingGuide);
router.delete('/admin/:id', auth_1.requireAuth, buying_guides_controller_1.deleteBuyingGuide);
router.get('/:slug', buying_guides_controller_1.getBuyingGuideBySlug);
exports.default = router;
//# sourceMappingURL=buying-guides.routes.js.map