"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_1.requireAuth, analytics_controller_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map