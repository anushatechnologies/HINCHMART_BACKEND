import { Router } from 'express';
import { getDashboardStats, updateOrderStatus, getAllOrders, getCreditNotes, getDashboardChartData, triggerErpSync, getWalletTransactions, approveWalletTransaction, getSystemMetrics } from './admin.controller';
import { getAllReviewsAdmin, updateReviewStatusAdmin, deleteReviewAdmin } from '../reviews/reviews.controller';
import { adminLogin } from './admin.auth.controller';
import { requireAdmin } from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';
import {
  getGlobalBrands,
  createGlobalBrand,
  updateGlobalBrand,
  deleteGlobalBrand,
  updateBrandStatus,
  getBrandRequests,
  updateBrandRequestStatus,
  getVendorBrandAccessRequests,
  updateVendorBrandAccessStatus
} from './admin-brands.controller';
import { getAllWarehousesAdmin } from './admin-warehouses.controller';
import { getPendingProducts, reviewProduct } from './admin-products.controller';

const router = Router();

// Public Admin Route
router.post('/login', adminLogin);

// Protected Admin Routes
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/charts', getDashboardChartData);

// Orders & RFQs
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/credit-notes', getCreditNotes);

// Reviews & Ratings
router.get('/reviews', getAllReviewsAdmin);
router.patch('/reviews/:id/status', updateReviewStatusAdmin);
router.put('/reviews/:id', updateReviewStatusAdmin);
router.delete('/reviews/:id', deleteReviewAdmin);

// Warehouses & Inventory
router.get('/warehouses', getAllWarehousesAdmin);

// Product Approvals
router.get('/products/pending', getPendingProducts);
router.patch('/products/:id/review', reviewProduct);

// Global Brands Catalog
router.get('/brands', getGlobalBrands);
router.post('/brands', createGlobalBrand);
router.put('/brands/:id', updateGlobalBrand);
router.delete('/brands/:id', deleteGlobalBrand);
router.patch('/brands/:id/status', updateBrandStatus);

// Brand Requests
router.get('/brands/requests', getBrandRequests);
router.patch('/brands/requests/:id', updateBrandRequestStatus);

// Brand Access Permissions
router.get('/brands/access', getVendorBrandAccessRequests);
router.patch('/brands/access/:id', updateVendorBrandAccessStatus);

// Finance & Wallets
router.get('/wallets/transactions', getWalletTransactions);
router.patch('/wallets/transactions/:id/approve', approveWalletTransaction);

// System & Integrations
router.get('/system/metrics', getSystemMetrics);
router.post('/erp/sync', triggerErpSync);

export default router;
