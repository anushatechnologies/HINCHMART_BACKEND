import { Router } from 'express';
import { getDashboardStats, updateOrderStatus, getAllOrders, getCreditNotes, getDashboardChartData, triggerErpSync, getWalletTransactions, approveWalletTransaction, getSystemMetrics } from './admin.controller';
import { getAllReviewsAdmin, updateReviewStatusAdmin } from '../reviews/reviews.controller';
import { adminLogin } from './admin.auth.controller';
import { requireAdmin } from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';
import {
  getGlobalBrands,
  createGlobalBrand,
  updateGlobalBrand,
  deleteGlobalBrand,
  toggleBrandStatus,
  uploadBrandLogo,
  getVendorBrandRequests,
  updateVendorBrandRequestStatus,
  getVendorBrandAccessRequests,
  updateVendorBrandAccessStatus
} from './admin-brands.controller';
import { getAllWarehousesAdmin } from './admin-warehouses.controller';
import { getPendingProducts, reviewProduct } from './admin-products.controller';


const router = Router();

// Public Admin Route
router.post('/login', adminLogin);

// RBAC Protected Admin Routes
router.use(requireAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/chart-data', getDashboardChartData);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/reviews', getAllReviewsAdmin);
router.put('/reviews/:id/approve', updateReviewStatusAdmin);

// ─── Global Brands CRUD ───
router.get('/brands', getGlobalBrands);
router.post('/brands', createGlobalBrand);
router.put('/brands/:id', updateGlobalBrand);
router.delete('/brands/:id', deleteGlobalBrand);
router.patch('/brands/:id/toggle-status', toggleBrandStatus);
router.post('/brands/:id/logo', upload.single('logo'), uploadBrandLogo);

// ─── Vendor Brand Requests ───
router.get('/brands/requests', getVendorBrandRequests);
router.patch('/brands/requests/:id/status', updateVendorBrandRequestStatus);

// ─── Vendor Brand Access ───
router.get('/brands/access', getVendorBrandAccessRequests);
router.patch('/brands/access/:id/status', updateVendorBrandAccessStatus);

// Warehouses
router.get('/warehouses', getAllWarehousesAdmin);

// Products
router.get('/products/pending', getPendingProducts);
router.post('/products/:id/review', reviewProduct);

router.get('/finance/credit-notes', getCreditNotes);

router.post('/erp/sync', triggerErpSync);

router.get('/wallets/transactions', getWalletTransactions);
router.post('/wallets/transactions/:id/approve', approveWalletTransaction);
router.get('/system/metrics', getSystemMetrics);

export default router;
