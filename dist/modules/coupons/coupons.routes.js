"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupons_controller_1 = require("./coupons.controller");
const router = (0, express_1.Router)();
router.get('/', coupons_controller_1.getCoupons);
router.post('/validate', coupons_controller_1.validateCoupon);
// In a real app, POST and DELETE should be protected by Admin Middleware
router.post('/', coupons_controller_1.createCoupon);
router.delete('/:id', coupons_controller_1.deleteCoupon);
exports.default = router;
//# sourceMappingURL=coupons.routes.js.map