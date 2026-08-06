import { Router } from 'express';
import { getVendors, createVendor, updateVendorStatus, updateVendorKycStatus, deleteVendor, registerVendor, loginVendor, verifyFirebaseVendor, updateVendorProfile, verifyOtp, forgotPassword, resetPassword, updateOnboardingProgress } from './vendors.controller';
import { saveOnboardingStep, submitKycForReview, granularSectionReview } from './vendor-onboarding.controller';
import { getStoreProfile, updateStoreProfile } from './vendor-store.controller';
import { getDashboardHome, getSalesDashboard, getAnalyticsDashboard } from './vendor-dashboard.controller';
import { getVendorOrders, updateOrderItemStatus } from './vendor-orders.controller';
import { 
  getFinanceOverview, getWalletLedger, getInvoices, getCreditNotes, getTaxReports 
} from './vendor-finance.controller';
import {
  getVendorProducts, getVendorProductById, createVendorProduct
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
  getVendorCategories, requestCategoryApproval,
  getVendorBrands, requestBrandApproval
} from './vendor-categories.controller';
import { getVendorReviews, replyToReview } from './vendor-reviews.controller';
import { getVendorSupportTickets, createSupportTicket, replySupportTicket } from './vendor-support.controller';
import { getVendorNotifications, markNotificationRead } from './vendor-notifications.controller';
import { getVendorTeamMembers, inviteTeamMember, updateTeamMemberRole, removeTeamMember } from './vendor-team.controller';
import { getVendorWarehouses, addVendorWarehouse, updateVendorWarehouse } from './vendor-warehouses.controller';
import { getVendorShippingTemplates, createShippingTemplate, updateShippingTemplate } from './vendor-shipping.controller';
import { getVendorServices, createVendorService } from './vendor-services.controller';
import { getVendorRentals, createRentalListing } from './vendor-rentals.controller';
import { getVendorAiInsights } from './vendor-ai.controller';
import { getVendorMarketingCampaigns, createMarketingCampaign } from './vendor-marketing.controller';
import { getVendorInventoryList, updateStockLevel } from './vendor-inventory.controller';
import { getVendorAnalyticsSummary } from './vendor-analytics.controller';
import { getVendorSettings, updateVendorSettings } from './vendor-settings.controller';
import { upload } from '../../middlewares/upload';
import { auth } from '../../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.post('/verify-firebase', verifyFirebaseVendor);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Catalog routes
router.get('/products', getVendorProducts);
router.get('/products/:id', getVendorProductById);
router.post('/products', createVendorProduct);

// Categories & Brands
router.get('/categories', getVendorCategories);
router.post('/categories/request', requestCategoryApproval);
router.get('/brands', getVendorBrands);
router.post('/brands/request', requestBrandApproval);

// Orders
router.get('/orders', getVendorOrders);
router.patch('/orders/:itemId/status', updateOrderItemStatus);

// Admin endpoints for vendors
router.get('/', getVendors);
router.post('/', createVendor);
router.patch('/:id/status', updateVendorStatus);
router.patch('/:id/kyc', updateVendorKycStatus);
router.delete('/:id', deleteVendor);

export default router;
