"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendors_controller_1 = require("./vendors.controller");
const vendor_orders_controller_1 = require("./vendor-orders.controller");
const vendor_products_controller_1 = require("./vendor-products.controller");
const vendor_categories_controller_1 = require("./vendor-categories.controller");
const vendor_analytics_controller_1 = require("./vendor-analytics.controller");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', vendors_controller_1.registerVendor);
router.post('/login', vendors_controller_1.loginVendor);
router.post('/verify-firebase', vendors_controller_1.verifyFirebaseVendor);
router.post('/verify-otp', vendors_controller_1.verifyOtp);
router.post('/forgot-password', vendors_controller_1.forgotPassword);
router.post('/reset-password', vendors_controller_1.resetPassword);
// Catalog routes
router.get('/products', vendor_products_controller_1.getVendorProducts);
router.get('/products/:id', vendor_products_controller_1.getVendorProductById);
router.post('/products', vendor_products_controller_1.createVendorProduct);
router.patch('/inventory/update', vendor_products_controller_1.updateVendorInventory);
// Categories & Brands
router.get('/categories', vendor_categories_controller_1.getVendorCategories);
router.post('/categories/request', vendor_categories_controller_1.requestCategoryApproval);
router.get('/brands', vendor_categories_controller_1.getVendorBrands);
router.post('/brands/request', vendor_categories_controller_1.requestBrandApproval);
// Orders
router.get('/orders', vendor_orders_controller_1.getVendorOrders);
router.patch('/orders/:itemId/status', vendor_orders_controller_1.updateOrderItemStatus);
// Analytics
router.get('/analytics/overview', vendor_analytics_controller_1.getAnalyticsOverview);
// Admin endpoints for vendors
router.get('/', vendors_controller_1.getVendors);
router.post('/', vendors_controller_1.createVendor);
router.patch('/:id/status', vendors_controller_1.updateVendorStatus);
router.patch('/:id/kyc', vendors_controller_1.updateVendorKycStatus);
router.delete('/:id', vendors_controller_1.deleteVendor);
exports.default = router;
//# sourceMappingURL=vendors.routes.js.map