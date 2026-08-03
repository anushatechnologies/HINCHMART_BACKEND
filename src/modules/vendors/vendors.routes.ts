import { Router } from 'express';
import { getVendors, createVendor, updateVendorStatus, updateVendorKycStatus, deleteVendor, registerVendor, loginVendor, verifyFirebaseVendor, updateVendorProfile, verifyOtp, forgotPassword, resetPassword, updateOnboardingProgress } from './vendors.controller';
import { getStoreProfile, updateStoreProfile } from './vendor-store.controller';
import { getDashboardHome, getSalesDashboard, getAnalyticsDashboard } from './vendor-dashboard.controller';
import { getVendorOrders, updateOrderItemStatus } from './vendor-orders.controller';
import { 
  getFinanceOverview, getWalletLedger, getInvoices, getCreditNotes, getTaxReports 
} from './vendor-finance.controller';
import {
  getVendorProducts, getVendorProductById, createVendorProduct,
  updateVendorProduct, deleteVendorProduct, restoreVendorProduct, updateVendorProductInventory
} from './vendor-products.controller';
import {
  getProductImages, addProductImage, deleteProductImage, setPrimaryImage,
  getProductVideos, addProductVideo, deleteProductVideo,
  getProductDocuments, addProductDocument, deleteProductDocument
} from './vendor-product-media.controller';
import {
  getProductVariants, createProductVariant, updateProductVariant, deleteProductVariant
} from './vendor-product-variants.controller';
import { exportProducts, importProducts, downloadTemplate } from './vendor-product-bulk.controller';
import {
  getVendorCategoryRequests, requestCategoryApproval,
  getVendorCategoryAttributes, getVendorBrands, requestBrandApproval
} from './vendor-categories.controller';
import {
  getInventoryOverview, adjustStock, getWarehouseInventory, transferStock,
  getBatches, createBatch, getInventoryHistory
} from './vendor-inventory.controller';
import {
  getPayoutsOverview, getSettlementsLedger, linkRazorpayAccount, requestManualPayout
} from './vendor-payments.controller';
import {
  getCouriers, addCourier, getPickupRequests, schedulePickup, getShippingOverview
} from './vendor-shipping.controller';
import {
  getRentalsOverview, getRentalProducts, configureRentalProduct, 
  getRentalBookings, updateBookingStatus, 
  getMaintenanceRecords, addMaintenanceRecord
} from './vendor-rentals.controller';
import {
  getServicesOverview, getServiceOfferings, createServiceOffering,
  getTimeSlots, createTimeSlot, getServiceAreas, createServiceArea,
  getServiceBookings, updateServiceBooking
} from './vendor-services.controller';
import { getTeamMembers, inviteTeamMember, createRole, getAuditLogs } from './vendor-team.controller';
import { getWarehouses, addWarehouse } from './vendor-warehouses.controller';
import {
  getCoupons, createCoupon, getFlashSales, createFlashSale,
  getAdCampaigns, createAdCampaign, getEmailCampaigns, createEmailCampaign
} from './vendor-marketing.controller';
import {
  getReviews, getReviewAnalytics, replyToReview, reportReview
} from './vendor-reviews.controller';
import {
  getReturnRequests, updateReturnStatus, getSupportTickets,
  updateTicketStatus, getChatMessages, sendChatMessage
} from './vendor-support.controller';
import { getAnalyticsOverview } from './vendor-analytics.controller';
import { getNotificationSettings, updateNotificationSettings } from './vendor-notifications.controller';
import { getSettings, updateSettings, createApiKey, deleteApiKey, createWebhook, deleteWebhook } from './vendor-settings.controller';
import { generateContent, analyzePricing, generateForecast, chatAssistant } from './vendor-ai.controller';
import { verifyGst, verifyPan, verifyBankAccount, submitKyc } from './vendor-kyc.controller';

const router = Router();

// ─── Module 1: Auth ───────────────────────────────────────────────────────────
router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.post('/verify-firebase', verifyFirebaseVendor);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ─── Module 5: Product Bulk Operations ────────────────────────────────────────
router.get('/products/export', exportProducts);
router.get('/products/template', downloadTemplate);
router.post('/products/import', importProducts);

// ─── Module 5: Products CRUD ─────────────────────────────────────────────────
router.get('/products', getVendorProducts);
router.post('/products', createVendorProduct);
router.get('/products/:id', getVendorProductById);
router.put('/products/:id', updateVendorProduct);
router.delete('/products/:id', deleteVendorProduct);
router.patch('/products/:id/restore', restoreVendorProduct);
router.patch('/products/:id/inventory', updateVendorProductInventory);

// ─── Module 5: Product Media ──────────────────────────────────────────────────
router.get('/products/:id/images', getProductImages);
router.post('/products/:id/images', addProductImage);
router.delete('/products/:id/images/:imageId', deleteProductImage);
router.patch('/products/:id/images/:imageId/primary', setPrimaryImage);

router.get('/products/:id/videos', getProductVideos);
router.post('/products/:id/videos', addProductVideo);
router.delete('/products/:id/videos/:videoId', deleteProductVideo);

router.get('/products/:id/documents', getProductDocuments);
router.post('/products/:id/documents', addProductDocument);
router.delete('/products/:id/documents/:docId', deleteProductDocument);

// ─── Module 5: Product Variants ──────────────────────────────────────────────
router.get('/products/:id/variants', getProductVariants);
router.post('/products/:id/variants', createProductVariant);
router.put('/products/:id/variants/:variantId', updateProductVariant);
router.delete('/products/:id/variants/:variantId', deleteProductVariant);

// ─── Finance ──────────────────────────────────────────────────────────────────
// ─── Module 12: Finance (Replaces old /finance endpoints) ─────────────────────
router.get('/finance/overview', getFinanceOverview);
router.get('/finance/wallet', getWalletLedger);
router.get('/finance/invoices', getInvoices);
router.get('/finance/credit-notes', getCreditNotes);
router.get('/finance/taxes', getTaxReports);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', getVendorOrders);
router.patch('/orders/:itemId/status', updateOrderItemStatus);

// ─── Module 6: Categories & Brands ─────────────────────────────────────────────
router.get('/:id/categories/requests', getVendorCategoryRequests);
router.post('/:id/categories/requests', requestCategoryApproval);
router.get('/:id/categories/attributes', getVendorCategoryAttributes);
router.get('/:id/brands', getVendorBrands);
router.post('/:id/brands', requestBrandApproval);

// ─── Module 7: Advanced Inventory ───────────────────────────────────────────────
router.get('/inventory', getInventoryOverview);
router.post('/inventory/adjust', adjustStock);
router.get('/inventory/warehouses', getWarehouseInventory);
router.post('/inventory/transfer', transferStock);
router.get('/inventory/history', getInventoryHistory);
router.get('/inventory/batches', getBatches);
router.post('/inventory/batches', createBatch);

// ─── Module 9: Razorpay Payments ────────────────────────────────────────────────
router.get('/payments/overview', getPayoutsOverview);
router.get('/payments/settlements', getSettlementsLedger);
router.post('/:id/payments/bank', linkRazorpayAccount);
router.post('/:id/payments/payout', requestManualPayout);

// ─── Module 9: Shipping & Fulfillment ─────────────────────────────────────────
router.get('/shipping/couriers', getCouriers);
router.post('/shipping/couriers', addCourier);
router.get('/shipping/pickups', getPickupRequests);
router.post('/shipping/pickups', schedulePickup);
router.get('/shipping/overview', getShippingOverview);

// ─── Module 10: Rentals ───────────────────────────────────────────────────────
router.get('/rentals/overview', getRentalsOverview);
router.get('/rentals/products', getRentalProducts);
router.post('/rentals/products', configureRentalProduct);
router.get('/rentals/bookings', getRentalBookings);
router.patch('/rentals/bookings/:id/status', updateBookingStatus);
router.get('/rentals/maintenance', getMaintenanceRecords);
router.post('/rentals/maintenance', addMaintenanceRecord);

// ─── Module 11: Services ────────────────────────────────────────────────────────
router.get('/services/overview', getServicesOverview);
router.get('/services/offerings', getServiceOfferings);
router.post('/services/offerings', createServiceOffering);
router.get('/services/slots', getTimeSlots);
router.post('/services/slots', createTimeSlot);
router.get('/services/areas', getServiceAreas);
router.post('/services/areas', createServiceArea);
router.get('/services/bookings', getServiceBookings);
router.patch('/services/bookings/:id/status', updateServiceBooking);

// ─── Module 13: Marketing ───────────────────────────────────────────────────────
router.get('/marketing/coupons', getCoupons);
router.post('/marketing/coupons', createCoupon);
router.get('/marketing/flash-sales', getFlashSales);
router.post('/marketing/flash-sales', createFlashSale);
router.get('/marketing/ads', getAdCampaigns);
router.post('/marketing/ads', createAdCampaign);
router.get('/marketing/emails', getEmailCampaigns);
router.post('/marketing/emails', createEmailCampaign);

// ─── Module 14: Reviews ─────────────────────────────────────────────────────────
router.get('/reviews', getReviews);
router.get('/reviews/analytics', getReviewAnalytics);
router.patch('/reviews/:id/reply', replyToReview);
router.patch('/reviews/:id/report', reportReview);

// ─── Module 15: Customer Support ────────────────────────────────────────────────
router.get('/support/returns', getReturnRequests);
router.patch('/support/returns/:id/status', updateReturnStatus);
router.get('/support/tickets', getSupportTickets);
router.patch('/support/tickets/:id/status', updateTicketStatus);
router.get('/support/chat', getChatMessages);
router.post('/support/chat', sendChatMessage);

// ─── Module 16: Analytics ───────────────────────────────────────────────────────
router.get('/analytics/overview', getAnalyticsOverview);

// ─── Module 18: Notifications ───────────────────────────────────────────────────
router.get('/notifications/settings', getNotificationSettings);
router.patch('/notifications/settings', updateNotificationSettings);

// ─── Module 19: Settings ────────────────────────────────────────────────────────
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.post('/settings/apikeys', createApiKey);
router.delete('/settings/apikeys/:id', deleteApiKey);
router.post('/settings/webhooks', createWebhook);
router.delete('/settings/webhooks/:id', deleteWebhook);

// ─── Module 20: AI Tools ────────────────────────────────────────────────────────
router.post('/ai/generate-content', generateContent);
router.post('/ai/analyze-pricing', analyzePricing);
router.get('/ai/forecast', generateForecast);
router.post('/ai/chat', chatAssistant);

// ─── Phase 6: Team & Warehouses ───────────────────────────────────────────────
router.get('/team', getTeamMembers);
router.post('/team/invite', inviteTeamMember);
router.post('/team/role', createRole);
router.get('/team/logs', getAuditLogs);
router.get('/warehouses', getWarehouses);
router.post('/warehouses', addWarehouse);

// ─── Module 4: Store & Dashboards ────────────────────────────────────────────
router.get('/:id/store', getStoreProfile);
router.put('/:id/store', updateStoreProfile);
router.get('/:id/dashboard/home', getDashboardHome);
router.get('/:id/dashboard/sales', getSalesDashboard);
router.get('/:id/dashboard/analytics', getAnalyticsDashboard);

// ─── Vendor CRUD ──────────────────────────────────────────────────────────────
router.get('/', getVendors);
router.post('/', createVendor);
router.put('/:id/profile', updateVendorProfile);
router.patch('/:id/onboarding', updateOnboardingProgress);
router.patch('/:id/status', updateVendorStatus);
router.patch('/:id/kyc-status', updateVendorKycStatus);
router.delete('/:id', deleteVendor);

// ─── KYC Verification ─────────────────────────────────────────────────────────
router.post('/:id/kyc/verify-gst', verifyGst);
router.post('/:id/kyc/verify-pan', verifyPan);
router.post('/:id/kyc/penny-drop', verifyBankAccount);
router.post('/:id/kyc/submit', submitKyc);

export default router;
