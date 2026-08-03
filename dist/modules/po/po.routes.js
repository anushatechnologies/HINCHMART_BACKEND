"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const po_controller_1 = require("./po.controller");
const auth_1 = require("../../middlewares/auth");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
// Storefront / B2B Web routes
router.get('/b2b/po', auth_1.requireAuth, po_controller_1.getMyPOs);
router.post('/b2b/po', auth_1.requireAuth, upload_1.upload.single('document'), po_controller_1.uploadPO);
// Admin routes
router.get('/admin/po', auth_1.requireAuth, po_controller_1.getAllPOs);
router.patch('/admin/po/:id/status', auth_1.requireAuth, po_controller_1.updatePOStatus);
exports.default = router;
//# sourceMappingURL=po.routes.js.map