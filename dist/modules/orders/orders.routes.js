"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_controller_1 = require("./orders.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', orders_controller_1.getMyOrders);
router.post('/checkout', orders_controller_1.checkout);
router.get('/:id/invoice', orders_controller_1.getOrderInvoice);
// Razorpay Payment Routes
router.post('/create-razorpay-order', orders_controller_1.createRazorpayOrder);
router.post('/verify-payment', orders_controller_1.verifyRazorpayPayment);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map