import { Router } from 'express';
import { getDashboardStats, updateOrderStatus, getAllOrders, getCreditNotes, getDashboardChartData, triggerErpSync, getWalletTransactions, approveWalletTransaction, getSystemMetrics } from './admin.controller';
import { getAllReviewsAdmin, updateReviewStatusAdmin } from '../reviews/reviews.controller';
import { adminLogin } from './admin.auth.controller';
import { requireAdmin } from '../../middlewares/auth';

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

router.get('/finance/credit-notes', getCreditNotes);

router.post('/erp/sync', triggerErpSync);

router.get('/wallets/transactions', getWalletTransactions);
router.post('/wallets/transactions/:id/approve', approveWalletTransaction);
router.get('/system/metrics', getSystemMetrics);

export default router;
