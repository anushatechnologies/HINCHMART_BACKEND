import { Router } from 'express';
import { getVendors, createVendor, updateVendorStatus, updateVendorKycStatus, deleteVendor, registerVendor, loginVendor, verifyFirebaseVendor, verifyOtp, forgotPassword, resetPassword, linkFirebaseProvider } from './vendors.controller';
import { getVendorOrders, updateOrderItemStatus } from './vendor-orders.controller';
import { getVendorProducts, getVendorProductById, createVendorProduct, updateVendorInventory } from './vendor-products.controller';
import { getVendorCategories, requestCategoryApproval, getVendorBrands, requestBrandApproval } from './vendor-categories.controller';
import { getAnalyticsOverview } from './vendor-analytics.controller';

const router = Router();

// Public routes
router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.post('/verify-firebase', verifyFirebaseVendor);
router.post('/link-provider', linkFirebaseProvider);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Catalog routes
router.get('/products', getVendorProducts);
router.get('/products/:id', getVendorProductById);
router.post('/products', createVendorProduct);
router.patch('/inventory/update', updateVendorInventory);

// Categories & Brands
router.get('/categories', getVendorCategories);
router.post('/categories/request', requestCategoryApproval);
router.get('/brands', getVendorBrands);
router.post('/brands/request', requestBrandApproval);

// Orders
router.get('/orders', getVendorOrders);
router.patch('/orders/:itemId/status', updateOrderItemStatus);

// Analytics
router.get('/analytics/overview', getAnalyticsOverview);

// Admin endpoints for vendors
router.get('/', getVendors);
router.post('/', createVendor);
router.patch('/:id/status', updateVendorStatus);
router.patch('/:id/kyc', updateVendorKycStatus);
router.delete('/:id', deleteVendor);

export default router;
