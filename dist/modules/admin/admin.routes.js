"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const reviews_controller_1 = require("../reviews/reviews.controller");
const admin_auth_controller_1 = require("./admin.auth.controller");
const auth_1 = require("../../middlewares/auth");
const admin_brands_controller_1 = require("./admin-brands.controller");
const admin_warehouses_controller_1 = require("./admin-warehouses.controller");
const admin_products_controller_1 = require("./admin-products.controller");
const banners_routes_1 = __importDefault(require("../banners/banners.routes"));
const router = (0, express_1.Router)();
// Public Admin Route
router.post('/login', admin_auth_controller_1.adminLogin);
// Protected Admin Routes
router.use(auth_1.requireAdmin);
// Dashboard
router.get('/dashboard/stats', admin_controller_1.getDashboardStats);
router.get('/dashboard/charts', admin_controller_1.getDashboardChartData);
router.get('/dashboard/chart-data', admin_controller_1.getDashboardChartData);
// Banners
router.use('/banners', banners_routes_1.default);
// Orders & RFQs
router.get('/orders', admin_controller_1.getAllOrders);
router.patch('/orders/:id/status', admin_controller_1.updateOrderStatus);
router.get('/credit-notes', admin_controller_1.getCreditNotes);
// Reviews & Ratings
router.get('/reviews', reviews_controller_1.getAllReviewsAdmin);
router.patch('/reviews/:id/status', reviews_controller_1.updateReviewStatusAdmin);
router.put('/reviews/:id', reviews_controller_1.updateReviewStatusAdmin);
router.delete('/reviews/:id', reviews_controller_1.deleteReviewAdmin);
// Warehouses & Inventory
router.get('/warehouses', admin_warehouses_controller_1.getAllWarehousesAdmin);
// Product Approvals
router.get('/products/pending', admin_products_controller_1.getPendingProducts);
router.patch('/products/:id/review', admin_products_controller_1.reviewProduct);
// Global Brands Catalog
router.get('/brands', admin_brands_controller_1.getGlobalBrands);
router.post('/brands', admin_brands_controller_1.createGlobalBrand);
router.put('/brands/:id', admin_brands_controller_1.updateGlobalBrand);
router.delete('/brands/:id', admin_brands_controller_1.deleteGlobalBrand);
router.patch('/brands/:id/status', admin_brands_controller_1.updateBrandStatus);
// Brand Requests
router.get('/brands/requests', admin_brands_controller_1.getBrandRequests);
router.patch('/brands/requests/:id', admin_brands_controller_1.updateBrandRequestStatus);
// Brand Access Permissions
router.get('/brands/access', admin_brands_controller_1.getVendorBrandAccessRequests);
router.patch('/brands/access/:id', admin_brands_controller_1.updateVendorBrandAccessStatus);
// Finance & Wallets
router.get('/wallets/transactions', admin_controller_1.getWalletTransactions);
router.patch('/wallets/transactions/:id/approve', admin_controller_1.approveWalletTransaction);
// System & Integrations
router.get('/system/metrics', admin_controller_1.getSystemMetrics);
router.post('/erp/sync', admin_controller_1.triggerErpSync);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map