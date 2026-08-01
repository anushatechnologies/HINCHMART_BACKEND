import { Router } from 'express';
import { getDashboardStats, updateOrderStatus, getAllOrders, getCreditNotes, getDashboardChartData, triggerErpSync } from './admin.controller';
import { getAllReviewsAdmin, updateReviewStatusAdmin } from '../reviews/reviews.controller';
import { adminLogin } from './admin.auth.controller';

const router = Router();

// Public Admin Route
router.post('/login', adminLogin);

// In a real app, apply admin RBAC middleware here
// router.use(requireAdminAuth);

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/chart-data', getDashboardChartData);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/reviews', getAllReviewsAdmin);
router.put('/reviews/:id/approve', updateReviewStatusAdmin);

router.get('/finance/credit-notes', getCreditNotes);

router.post('/erp/sync', triggerErpSync);

export default router;
