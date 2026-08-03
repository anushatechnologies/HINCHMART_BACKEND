"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewAnalytics = exports.reportReview = exports.replyToReview = exports.getReviews = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Fetch Reviews ───────────────────────────────────────────────────────────
const getReviews = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        // Get all products belonging to the vendor
        const products = await prisma.product.findMany({
            where: { vendorId },
            select: { id: true }
        });
        const productIds = products.map((p) => p.id);
        const reviews = await prisma.review.findMany({
            where: { productId: { in: productIds } },
            include: {
                product: { select: { name: true } },
                user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getReviews = getReviews;
// ─── Reply to Review ─────────────────────────────────────────────────────────
const replyToReview = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { vendorReply } = req.body;
        const review = await prisma.review.update({
            where: { id },
            data: {
                vendorReply,
                vendorRepliedAt: new Date()
            }
        });
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.replyToReview = replyToReview;
// ─── Report Review ───────────────────────────────────────────────────────────
const reportReview = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { reason } = req.body;
        const review = await prisma.review.update({
            where: { id },
            data: {
                isReported: true,
                reportReason: reason
            }
        });
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.reportReview = reportReview;
// ─── Rating Analytics ────────────────────────────────────────────────────────
const getReviewAnalytics = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const products = await prisma.product.findMany({
            where: { vendorId },
            select: { id: true }
        });
        const productIds = products.map((p) => p.id);
        const reviews = await prisma.review.findMany({
            where: { productId: { in: productIds } },
            select: { rating: true, productId: true }
        });
        if (reviews.length === 0) {
            res.status(200).json({ success: true, data: { averageRating: 0, totalReviews: 0, distribution: {} } });
            return;
        }
        let totalRating = 0;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const productScores = {};
        reviews.forEach((r) => {
            totalRating += r.rating;
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            if (!productScores[r.productId]) {
                productScores[r.productId] = { sum: 0, count: 0 };
            }
            productScores[r.productId].sum += r.rating;
            productScores[r.productId].count += 1;
        });
        const averageRating = (totalRating / reviews.length).toFixed(1);
        res.status(200).json({
            success: true,
            data: {
                averageRating: parseFloat(averageRating),
                totalReviews: reviews.length,
                distribution,
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getReviewAnalytics = getReviewAnalytics;
//# sourceMappingURL=vendor-reviews.controller.js.map