"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewProduct = exports.getPendingProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get products that are waiting for review
const getPendingProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                approvalStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] }
            },
            include: {
                vendor: { select: { companyName: true, contactEmail: true } },
                category: true,
                variants: true,
                images: true,
                documents: true,
                rentalDetails: true
            },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch pending products', error: error.message });
    }
};
exports.getPendingProducts = getPendingProducts;
// Review a product (Approve, Reject, or Request Changes)
const reviewProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { action, comments } = req.body; // action: 'APPROVE', 'REJECT', 'REQUEST_CHANGES'
        if (!action) {
            res.status(400).json({ success: false, message: 'Action is required' });
            return;
        }
        let status = '';
        if (action === 'APPROVE')
            status = 'APPROVED';
        else if (action === 'REJECT')
            status = 'REJECTED';
        else if (action === 'REQUEST_CHANGES')
            status = 'CHANGES_REQUIRED';
        else {
            res.status(400).json({ success: false, message: 'Invalid action' });
            return;
        }
        const product = await prisma.product.update({
            where: { id },
            data: { approvalStatus: status }
            // In a real system, you might save the `comments` to a ProductReviewLog or AuditLog table here.
        });
        res.status(200).json({ success: true, message: `Product status updated to ${status}`, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to review product', error: error.message });
    }
};
exports.reviewProduct = reviewProduct;
//# sourceMappingURL=admin-products.controller.js.map