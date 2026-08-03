"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("./reviews.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Storefront routes
router.get('/my-reviews', auth_1.requireAuth, reviews_controller_1.getMyReviews);
router.get('/products/:productId/reviews', reviews_controller_1.getProductReviews);
router.post('/products/:productId/reviews', auth_1.requireAuth, reviews_controller_1.createReview);
// Admin routes (mounted at /api/admin/reviews)
router.get('/admin/reviews', auth_1.requireAuth, reviews_controller_1.getAllReviewsAdmin);
router.put('/admin/reviews/:id', auth_1.requireAuth, reviews_controller_1.updateReviewStatusAdmin);
router.delete('/admin/reviews/:id', auth_1.requireAuth, reviews_controller_1.deleteReviewAdmin);
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map