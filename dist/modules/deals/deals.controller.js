"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeal = exports.updateDeal = exports.createDeal = exports.getAllDealsAdmin = exports.getActiveDeals = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Public: List active deals / offers ───────────────────────────────────────
const getActiveDeals = async (req, res) => {
    try {
        const now = new Date();
        const deals = await prisma_1.default.deal.findMany({
            where: {
                isActive: true,
                startTime: { lte: now },
                endTime: { gte: now },
            },
            include: {
                product: {
                    include: { images: true, category: true }
                }
            },
            orderBy: { id: 'desc' }
        });
        return res.json({ success: true, data: deals });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getActiveDeals = getActiveDeals;
// ─── Admin: Get all deals ─────────────────────────────────────────────────────
const getAllDealsAdmin = async (req, res) => {
    try {
        const deals = await prisma_1.default.deal.findMany({
            include: { product: { select: { name: true, basePrice: true } } },
            orderBy: { id: 'desc' }
        });
        return res.json({ success: true, data: deals });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllDealsAdmin = getAllDealsAdmin;
// ─── Admin: Create deal ───────────────────────────────────────────────────────
const createDeal = async (req, res) => {
    try {
        const { productId, dealPrice, startTime, endTime } = req.body;
        if (!productId || !dealPrice || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const deal = await prisma_1.default.deal.create({
            data: {
                productId: parseInt(productId),
                dealPrice: parseFloat(dealPrice),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isActive: true
            },
            include: { product: { select: { name: true } } }
        });
        return res.status(201).json({ success: true, data: deal });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.createDeal = createDeal;
// ─── Admin: Update deal status ────────────────────────────────────────────────
const updateDeal = async (req, res) => {
    try {
        const { dealPrice, startTime, endTime, isActive } = req.body;
        const deal = await prisma_1.default.deal.update({
            where: { id: parseInt(req.params.id) },
            data: {
                dealPrice: dealPrice ? parseFloat(dealPrice) : undefined,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                isActive
            }
        });
        return res.json({ success: true, data: deal });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateDeal = updateDeal;
// ─── Admin: Delete deal ───────────────────────────────────────────────────────
const deleteDeal = async (req, res) => {
    try {
        await prisma_1.default.deal.delete({ where: { id: parseInt(req.params.id) } });
        return res.json({ success: true, message: 'Deal deleted' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteDeal = deleteDeal;
//# sourceMappingURL=deals.controller.js.map