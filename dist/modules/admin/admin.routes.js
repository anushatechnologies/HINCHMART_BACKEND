"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const reviews_controller_1 = require("../reviews/reviews.controller");
const admin_auth_controller_1 = require("./admin.auth.controller");
const router = (0, express_1.Router)();
// Public Admin Route
router.post('/login', admin_auth_controller_1.adminLogin);
// In a real app, apply admin RBAC middleware here
// router.use(requireAdminAuth);
router.get('/dashboard/stats', admin_controller_1.getDashboardStats);
router.get('/dashboard/chart-data', admin_controller_1.getDashboardChartData);
router.get('/orders', admin_controller_1.getAllOrders);
router.put('/orders/:id/status', admin_controller_1.updateOrderStatus);
router.get('/reviews', reviews_controller_1.getAllReviewsAdmin);
router.put('/reviews/:id/approve', reviews_controller_1.updateReviewStatusAdmin);
router.get('/finance/credit-notes', admin_controller_1.getCreditNotes);
router.post('/erp/sync', admin_controller_1.triggerErpSync);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map