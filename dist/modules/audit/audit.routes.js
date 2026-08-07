"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("./audit.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/audit-logs', auth_1.requireAdmin, audit_controller_1.getAuditLogs);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map