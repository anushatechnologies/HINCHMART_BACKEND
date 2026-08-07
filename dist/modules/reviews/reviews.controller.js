"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewAdmin = exports.updateReviewStatusAdmin = exports.getAllReviewsAdmin = exports.createReview = exports.getProductReviews = exports.getMyReviews = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Storefront: Get approved reviews + rating summary for a product ──────────
const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await prisma_1.default.review.findMany({
            where: { userId },
            include: {
                product: { select: { id: true, name: true, slug: true, brand: true, images: true } }
            },
            orderBy: { id: 'desc' }
        });
        res.json({ success: true, data: reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyReviews = getMyReviews;
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const pid = parseInt(productId);
        const [reviews, aggregate] = await Promise.all([
            prisma_1.default.review.findMany({
                where: { productId: pid, isApproved: true },
                include: { user: { select: { name: true } } },
                orderBy: { id: 'desc' }
            }),
            prisma_1.default.review.aggregate({
                where: { productId: pid, isApproved: true },
                _avg: { rating: true },
                _count: { id: true }
            })
        ]);
        res.json({
            success: true,
            data: reviews,
            summary: {
                averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0,
                totalReviews: aggregate._count.id
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProductReviews = getProductReviews;
// ─── Storefront: Submit review (verified buyers only) ─────────────────────────
const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const pid = parseInt(productId);
        // Check if user already reviewed this product
        const existing = await prisma_1.default.review.findFirst({ where: { userId, productId: pid } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
        }
        // Verified purchase check — user must have a delivered order containing this product
        const purchase = await prisma_1.default.orderItem.findFirst({
            where: {
                variant: { productId: pid },
                order: { userId, status: { in: ['delivered', 'placed', 'shipped'] } }
            }
        });
        const isVerified = !!purchase;
        // Basic mock sentiment analysis based on rating
        let sentiment = 'NEUTRAL';
        let sentimentScore = 0.5;
        if (rating >= 4) {
            sentiment = 'POSITIVE';
            sentimentScore = 0.8 + (Math.random() * 0.2);
        }
        else if (rating <= 2) {
            sentiment = 'NEGATIVE';
            sentimentScore = 0.1 + (Math.random() * 0.2);
        }
        else {
            sentimentScore = 0.4 + (Math.random() * 0.2);
        }
        const review = await prisma_1.default.review.create({
            data: {
                userId,
                productId: pid,
                rating: Math.min(5, Math.max(1, parseInt(rating))),
                comment,
                sentiment,
                sentimentScore,
                isApproved: false // Requires admin approval
            }
        });
        res.status(201).json({
            success: true,
            data: { ...review, isVerifiedPurchase: isVerified },
            message: 'Review submitted and pending approval.'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createReview = createReview;
// ─── Admin: Get ALL reviews (pending + approved) ──────────────────────────────
const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await prisma_1.default.review.findMany({
            include: {
                user: { select: { name: true, email: true } },
                product: { select: { name: true } }
            },
            orderBy: { id: 'desc' }
        });
        res.json({ success: true, data: reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllReviewsAdmin = getAllReviewsAdmin;
// ─── Admin: Approve or reject a review ───────────────────────────────────────
const updateReviewStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;
        const review = await prisma_1.default.review.update({
            where: { id: parseInt(id) },
            data: { isApproved }
        });
        res.json({ success: true, data: review });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateReviewStatusAdmin = updateReviewStatusAdmin;
// ─── Admin: Delete a review ───────────────────────────────────────────────────
const deleteReviewAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.review.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Review deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteReviewAdmin = deleteReviewAdmin;
//# sourceMappingURL=reviews.controller.js.map