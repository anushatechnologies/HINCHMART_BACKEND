"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendors_controller_1 = require("./vendors.controller");
const vendor_store_controller_1 = require("./vendor-store.controller");
const vendor_dashboard_controller_1 = require("./vendor-dashboard.controller");
const vendor_orders_controller_1 = require("./vendor-orders.controller");
const vendor_finance_controller_1 = require("./vendor-finance.controller");
const vendor_products_controller_1 = require("./vendor-products.controller");
const vendor_product_media_controller_1 = require("./vendor-product-media.controller");
const vendor_product_variants_controller_1 = require("./vendor-product-variants.controller");
const vendor_product_bulk_controller_1 = require("./vendor-product-bulk.controller");
const vendor_categories_controller_1 = require("./vendor-categories.controller");
const vendor_inventory_controller_1 = require("./vendor-inventory.controller");
const vendor_payments_controller_1 = require("./vendor-payments.controller");
const vendor_shipping_controller_1 = require("./vendor-shipping.controller");
const vendor_rentals_controller_1 = require("./vendor-rentals.controller");
const vendor_services_controller_1 = require("./vendor-services.controller");
const vendor_team_controller_1 = require("./vendor-team.controller");
const vendor_warehouses_controller_1 = require("./vendor-warehouses.controller");
const vendor_marketing_controller_1 = require("./vendor-marketing.controller");
const vendor_reviews_controller_1 = require("./vendor-reviews.controller");
const vendor_support_controller_1 = require("./vendor-support.controller");
const vendor_analytics_controller_1 = require("./vendor-analytics.controller");
const vendor_notifications_controller_1 = require("./vendor-notifications.controller");
const vendor_settings_controller_1 = require("./vendor-settings.controller");
const vendor_ai_controller_1 = require("./vendor-ai.controller");
const vendor_kyc_controller_1 = require("./vendor-kyc.controller");
const router = (0, express_1.Router)();
// ─── Module 1: Auth ───────────────────────────────────────────────────────────
router.post('/register', vendors_controller_1.registerVendor);
router.post('/login', vendors_controller_1.loginVendor);
router.post('/verify-otp', vendors_controller_1.verifyOtp);
router.post('/forgot-password', vendors_controller_1.forgotPassword);
router.post('/reset-password', vendors_controller_1.resetPassword);
// ─── Module 5: Product Bulk Operations ────────────────────────────────────────
router.get('/products/export', vendor_product_bulk_controller_1.exportProducts);
router.get('/products/template', vendor_product_bulk_controller_1.downloadTemplate);
router.post('/products/import', vendor_product_bulk_controller_1.importProducts);
// ─── Module 5: Products CRUD ─────────────────────────────────────────────────
router.get('/products', vendor_products_controller_1.getVendorProducts);
router.post('/products', vendor_products_controller_1.createVendorProduct);
router.get('/products/:id', vendor_products_controller_1.getVendorProductById);
router.put('/products/:id', vendor_products_controller_1.updateVendorProduct);
router.delete('/products/:id', vendor_products_controller_1.deleteVendorProduct);
router.patch('/products/:id/restore', vendor_products_controller_1.restoreVendorProduct);
router.patch('/products/:id/inventory', vendor_products_controller_1.updateVendorProductInventory);
// ─── Module 5: Product Media ──────────────────────────────────────────────────
router.get('/products/:id/images', vendor_product_media_controller_1.getProductImages);
router.post('/products/:id/images', vendor_product_media_controller_1.addProductImage);
router.delete('/products/:id/images/:imageId', vendor_product_media_controller_1.deleteProductImage);
router.patch('/products/:id/images/:imageId/primary', vendor_product_media_controller_1.setPrimaryImage);
router.get('/products/:id/videos', vendor_product_media_controller_1.getProductVideos);
router.post('/products/:id/videos', vendor_product_media_controller_1.addProductVideo);
router.delete('/products/:id/videos/:videoId', vendor_product_media_controller_1.deleteProductVideo);
router.get('/products/:id/documents', vendor_product_media_controller_1.getProductDocuments);
router.post('/products/:id/documents', vendor_product_media_controller_1.addProductDocument);
router.delete('/products/:id/documents/:docId', vendor_product_media_controller_1.deleteProductDocument);
// ─── Module 5: Product Variants ──────────────────────────────────────────────
router.get('/products/:id/variants', vendor_product_variants_controller_1.getProductVariants);
router.post('/products/:id/variants', vendor_product_variants_controller_1.createProductVariant);
router.put('/products/:id/variants/:variantId', vendor_product_variants_controller_1.updateProductVariant);
router.delete('/products/:id/variants/:variantId', vendor_product_variants_controller_1.deleteProductVariant);
// ─── Finance ──────────────────────────────────────────────────────────────────
// ─── Module 12: Finance (Replaces old /finance endpoints) ─────────────────────
router.get('/finance/overview', vendor_finance_controller_1.getFinanceOverview);
router.get('/finance/wallet', vendor_finance_controller_1.getWalletLedger);
router.get('/finance/invoices', vendor_finance_controller_1.getInvoices);
router.get('/finance/credit-notes', vendor_finance_controller_1.getCreditNotes);
router.get('/finance/taxes', vendor_finance_controller_1.getTaxReports);
// ─── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', vendor_orders_controller_1.getVendorOrders);
router.patch('/orders/:itemId/status', vendor_orders_controller_1.updateOrderItemStatus);
// ─── Module 6: Categories & Brands ─────────────────────────────────────────────
router.get('/:id/categories/requests', vendor_categories_controller_1.getVendorCategoryRequests);
router.post('/:id/categories/requests', vendor_categories_controller_1.requestCategoryApproval);
router.get('/:id/categories/attributes', vendor_categories_controller_1.getVendorCategoryAttributes);
router.get('/:id/brands', vendor_categories_controller_1.getVendorBrands);
router.post('/:id/brands', vendor_categories_controller_1.requestBrandApproval);
// ─── Module 7: Advanced Inventory ───────────────────────────────────────────────
router.get('/inventory', vendor_inventory_controller_1.getInventoryOverview);
router.post('/inventory/adjust', vendor_inventory_controller_1.adjustStock);
router.get('/inventory/warehouses', vendor_inventory_controller_1.getWarehouseInventory);
router.post('/inventory/transfer', vendor_inventory_controller_1.transferStock);
router.get('/inventory/history', vendor_inventory_controller_1.getInventoryHistory);
router.get('/inventory/batches', vendor_inventory_controller_1.getBatches);
router.post('/inventory/batches', vendor_inventory_controller_1.createBatch);
// ─── Module 9: Razorpay Payments ────────────────────────────────────────────────
router.get('/payments/overview', vendor_payments_controller_1.getPayoutsOverview);
router.get('/payments/settlements', vendor_payments_controller_1.getSettlementsLedger);
router.post('/:id/payments/bank', vendor_payments_controller_1.linkRazorpayAccount);
router.post('/:id/payments/payout', vendor_payments_controller_1.requestManualPayout);
// ─── Module 9: Shipping & Fulfillment ─────────────────────────────────────────
router.get('/shipping/couriers', vendor_shipping_controller_1.getCouriers);
router.post('/shipping/couriers', vendor_shipping_controller_1.addCourier);
router.get('/shipping/pickups', vendor_shipping_controller_1.getPickupRequests);
router.post('/shipping/pickups', vendor_shipping_controller_1.schedulePickup);
router.get('/shipping/overview', vendor_shipping_controller_1.getShippingOverview);
// ─── Module 10: Rentals ───────────────────────────────────────────────────────
router.get('/rentals/overview', vendor_rentals_controller_1.getRentalsOverview);
router.get('/rentals/products', vendor_rentals_controller_1.getRentalProducts);
router.post('/rentals/products', vendor_rentals_controller_1.configureRentalProduct);
router.get('/rentals/bookings', vendor_rentals_controller_1.getRentalBookings);
router.patch('/rentals/bookings/:id/status', vendor_rentals_controller_1.updateBookingStatus);
router.get('/rentals/maintenance', vendor_rentals_controller_1.getMaintenanceRecords);
router.post('/rentals/maintenance', vendor_rentals_controller_1.addMaintenanceRecord);
// ─── Module 11: Services ────────────────────────────────────────────────────────
router.get('/services/overview', vendor_services_controller_1.getServicesOverview);
router.get('/services/offerings', vendor_services_controller_1.getServiceOfferings);
router.post('/services/offerings', vendor_services_controller_1.createServiceOffering);
router.get('/services/slots', vendor_services_controller_1.getTimeSlots);
router.post('/services/slots', vendor_services_controller_1.createTimeSlot);
router.get('/services/areas', vendor_services_controller_1.getServiceAreas);
router.post('/services/areas', vendor_services_controller_1.createServiceArea);
router.get('/services/bookings', vendor_services_controller_1.getServiceBookings);
router.patch('/services/bookings/:id/status', vendor_services_controller_1.updateServiceBooking);
// ─── Module 13: Marketing ───────────────────────────────────────────────────────
router.get('/marketing/coupons', vendor_marketing_controller_1.getCoupons);
router.post('/marketing/coupons', vendor_marketing_controller_1.createCoupon);
router.get('/marketing/flash-sales', vendor_marketing_controller_1.getFlashSales);
router.post('/marketing/flash-sales', vendor_marketing_controller_1.createFlashSale);
router.get('/marketing/ads', vendor_marketing_controller_1.getAdCampaigns);
router.post('/marketing/ads', vendor_marketing_controller_1.createAdCampaign);
router.get('/marketing/emails', vendor_marketing_controller_1.getEmailCampaigns);
router.post('/marketing/emails', vendor_marketing_controller_1.createEmailCampaign);
// ─── Module 14: Reviews ─────────────────────────────────────────────────────────
router.get('/reviews', vendor_reviews_controller_1.getReviews);
router.get('/reviews/analytics', vendor_reviews_controller_1.getReviewAnalytics);
router.patch('/reviews/:id/reply', vendor_reviews_controller_1.replyToReview);
router.patch('/reviews/:id/report', vendor_reviews_controller_1.reportReview);
// ─── Module 15: Customer Support ────────────────────────────────────────────────
router.get('/support/returns', vendor_support_controller_1.getReturnRequests);
router.patch('/support/returns/:id/status', vendor_support_controller_1.updateReturnStatus);
router.get('/support/tickets', vendor_support_controller_1.getSupportTickets);
router.patch('/support/tickets/:id/status', vendor_support_controller_1.updateTicketStatus);
router.get('/support/chat', vendor_support_controller_1.getChatMessages);
router.post('/support/chat', vendor_support_controller_1.sendChatMessage);
// ─── Module 16: Analytics ───────────────────────────────────────────────────────
router.get('/analytics/overview', vendor_analytics_controller_1.getAnalyticsOverview);
// ─── Module 18: Notifications ───────────────────────────────────────────────────
router.get('/notifications/settings', vendor_notifications_controller_1.getNotificationSettings);
router.patch('/notifications/settings', vendor_notifications_controller_1.updateNotificationSettings);
// ─── Module 19: Settings ────────────────────────────────────────────────────────
router.get('/settings', vendor_settings_controller_1.getSettings);
router.patch('/settings', vendor_settings_controller_1.updateSettings);
router.post('/settings/apikeys', vendor_settings_controller_1.createApiKey);
router.delete('/settings/apikeys/:id', vendor_settings_controller_1.deleteApiKey);
router.post('/settings/webhooks', vendor_settings_controller_1.createWebhook);
router.delete('/settings/webhooks/:id', vendor_settings_controller_1.deleteWebhook);
// ─── Module 20: AI Tools ────────────────────────────────────────────────────────
router.post('/ai/generate-content', vendor_ai_controller_1.generateContent);
router.post('/ai/analyze-pricing', vendor_ai_controller_1.analyzePricing);
router.get('/ai/forecast', vendor_ai_controller_1.generateForecast);
router.post('/ai/chat', vendor_ai_controller_1.chatAssistant);
// ─── Phase 6: Team & Warehouses ───────────────────────────────────────────────
router.get('/team', vendor_team_controller_1.getTeamMembers);
router.post('/team/invite', vendor_team_controller_1.inviteTeamMember);
router.post('/team/role', vendor_team_controller_1.createRole);
router.get('/team/logs', vendor_team_controller_1.getAuditLogs);
router.get('/warehouses', vendor_warehouses_controller_1.getWarehouses);
router.post('/warehouses', vendor_warehouses_controller_1.addWarehouse);
// ─── Module 4: Store & Dashboards ────────────────────────────────────────────
router.get('/:id/store', vendor_store_controller_1.getStoreProfile);
router.put('/:id/store', vendor_store_controller_1.updateStoreProfile);
router.get('/:id/dashboard/home', vendor_dashboard_controller_1.getDashboardHome);
router.get('/:id/dashboard/sales', vendor_dashboard_controller_1.getSalesDashboard);
router.get('/:id/dashboard/analytics', vendor_dashboard_controller_1.getAnalyticsDashboard);
// ─── Vendor CRUD ──────────────────────────────────────────────────────────────
router.get('/', vendors_controller_1.getVendors);
router.post('/', vendors_controller_1.createVendor);
router.put('/:id/profile', vendors_controller_1.updateVendorProfile);
router.patch('/:id/onboarding', vendors_controller_1.updateOnboardingProgress);
router.patch('/:id/status', vendors_controller_1.updateVendorStatus);
router.patch('/:id/kyc-status', vendors_controller_1.updateVendorKycStatus);
router.delete('/:id', vendors_controller_1.deleteVendor);
// ─── KYC Verification ─────────────────────────────────────────────────────────
router.post('/:id/kyc/verify-gst', vendor_kyc_controller_1.verifyGst);
router.post('/:id/kyc/verify-pan', vendor_kyc_controller_1.verifyPan);
router.post('/:id/kyc/penny-drop', vendor_kyc_controller_1.verifyBankAccount);
router.post('/:id/kyc/submit', vendor_kyc_controller_1.submitKyc);
exports.default = router;
//# sourceMappingURL=vendors.routes.js.map