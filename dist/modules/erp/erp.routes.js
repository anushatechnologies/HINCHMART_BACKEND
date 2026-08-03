"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const erp_controller_1 = require("./erp.controller");
const router = (0, express_1.Router)();
// Note: In a real system, you'd protect this with a specific API key or signature check middleware
router.post('/webhook/sap-inventory', erp_controller_1.sapInventoryWebhook);
exports.default = router;
//# sourceMappingURL=erp.routes.js.map