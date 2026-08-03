"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settlements_controller_1 = require("./settlements.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, settlements_controller_1.getSettlements);
router.patch('/:id/pay', auth_1.requireAuth, settlements_controller_1.paySettlement);
exports.default = router;
//# sourceMappingURL=settlements.routes.js.map