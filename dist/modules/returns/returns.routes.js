"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const returns_controller_1 = require("./returns.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Customer
router.post('/initiate', auth_1.requireAuth, returns_controller_1.initiateReturn);
// Admin / Vendor
router.get('/admin', auth_1.requireAuth, returns_controller_1.getReturnRequests);
router.patch('/admin/:id/status', auth_1.requireAuth, returns_controller_1.updateReturnStatus);
exports.default = router;
//# sourceMappingURL=returns.routes.js.map