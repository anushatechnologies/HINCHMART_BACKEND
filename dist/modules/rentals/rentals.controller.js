"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRentalRequests = exports.updateRentalStatus = exports.getAllRentalRequests = exports.createRentalRequest = exports.getRentableProducts = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// GET /api/rentals — list all rentable products
const getRentableProducts = async (req, res) => {
    try {
        const { category, city, page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = { isRentable: true, isActive: true };
        if (category)
            where.category = { slug: category };
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                include: { images: true, category: true },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.product.count({ where }),
        ]);
        return res.json({ success: true, data: products, total });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRentableProducts = getRentableProducts;
// POST /api/rentals/request — create a rental request
const createRentalRequest = async (req, res) => {
    try {
        const { productId, customerName, customerPhone, customerEmail, startDate, durationDays, city, notes, } = req.body;
        if (!productId || !customerName || !customerPhone || !startDate || !durationDays || !city) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        // Fetch product to calculate total
        const product = await prisma_1.default.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product || !product.isRentable || !product.rentPricePerDay) {
            return res.status(404).json({ success: false, message: 'Product not available for rent' });
        }
        const totalAmount = Number(product.rentPricePerDay) * parseInt(durationDays);
        const rental = await prisma_1.default.rentalRequest.create({
            data: {
                productId: parseInt(productId),
                userId: req.user?.id || null,
                customerName,
                customerPhone,
                customerEmail,
                startDate: new Date(startDate),
                durationDays: parseInt(durationDays),
                city,
                totalAmount,
                notes,
                status: 'PENDING',
            },
            include: { product: { include: { images: true } } },
        });
        return res.json({ success: true, data: rental });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createRentalRequest = createRentalRequest;
// GET /api/rentals/requests — admin: list all rental requests
const getAllRentalRequests = async (req, res) => {
    try {
        const { status, page = '1' } = req.query;
        const skip = (parseInt(page) - 1) * 20;
        const where = {};
        if (status)
            where.status = status;
        const [requests, total] = await Promise.all([
            prisma_1.default.rentalRequest.findMany({
                where,
                include: { product: { include: { images: true } } },
                skip,
                take: 20,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.rentalRequest.count({ where }),
        ]);
        return res.json({ success: true, data: requests, total });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllRentalRequests = getAllRentalRequests;
// PATCH /api/rentals/requests/:id/status — admin: update rental status
const updateRentalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma_1.default.rentalRequest.update({
            where: { id: parseInt(id) },
            data: { status },
        });
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateRentalStatus = updateRentalStatus;
// GET /api/rentals/my-requests — customer: list my rental requests
const getMyRentalRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await prisma_1.default.rentalRequest.findMany({
            where: { userId },
            include: { product: { include: { images: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: requests });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMyRentalRequests = getMyRentalRequests;
//# sourceMappingURL=rentals.controller.js.map