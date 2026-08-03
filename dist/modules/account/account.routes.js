"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const account_controller_1 = require("./account.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/dashboard', account_controller_1.getDashboard);
router.get('/me', account_controller_1.getProfile);
router.put('/me', account_controller_1.updateProfile);
router.put('/change-password', account_controller_1.changePassword);
router.get('/orders/:orderId', account_controller_1.getOrderById);
router.post('/orders/:orderId/cancel', account_controller_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=account.routes.js.map