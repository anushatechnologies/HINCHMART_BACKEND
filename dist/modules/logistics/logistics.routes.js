"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logistics_controller_1 = require("./logistics.controller");
const auth_1 = require("../../middlewares/auth");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
router.get('/partners', auth_1.requireAuth, logistics_controller_1.getPartners);
router.post('/partners', auth_1.requireAuth, logistics_controller_1.createPartner);
router.patch('/orders/:id/assign-delivery', auth_1.requireAuth, logistics_controller_1.assignDelivery);
router.post('/orders/:id/pod', auth_1.requireAuth, upload_1.upload.single('podImage'), logistics_controller_1.uploadPOD);
// Webhook for external logistics providers (e.g. Delhivery)
router.post('/webhook/delhivery', logistics_controller_1.delhiveryWebhook);
exports.default = router;
//# sourceMappingURL=logistics.routes.js.map