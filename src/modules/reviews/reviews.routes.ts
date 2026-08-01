import { Router } from 'express';
import { getMyReviews, getProductReviews, createReview, getAllReviewsAdmin, updateReviewStatusAdmin, deleteReviewAdmin } from './reviews.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Storefront routes
router.get('/my-reviews', requireAuth, getMyReviews);
router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', requireAuth, createReview);

// Admin routes (mounted at /api/admin/reviews)
router.get('/admin/reviews', requireAuth, getAllReviewsAdmin);
router.put('/admin/reviews/:id', requireAuth, updateReviewStatusAdmin);
router.delete('/admin/reviews/:id', requireAuth, deleteReviewAdmin);

export default router;
