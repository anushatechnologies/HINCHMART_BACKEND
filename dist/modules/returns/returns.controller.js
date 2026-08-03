"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnStatus = exports.getReturnRequests = exports.initiateReturn = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Customer: Initiate a Return Request ──────────────────────────────────────
const initiateReturn = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, reason } = req.body;
        if (!orderId || !reason) {
            return res.status(400).json({ success: false, message: 'orderId and reason are required' });
        }
        // Verify order belongs to user and is delivered (in real scenario check order status)
        const order = await prisma_1.default.order.findUnique({
            where: { id: parseInt(orderId) },
            include: { user: true, items: true }
        });
        if (!order || order.userId !== userId || order.items.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found or not eligible for return' });
        }
        const vendorId = order.items[0]?.vendorId || 1;
        const returnReq = await prisma_1.default.returnRequest.create({
            data: {
                vendorId,
                orderId: order.id,
                customerName: order.user?.name || 'Customer',
                reason,
                amount: order.total, // Returning full amount for simplicity
                status: 'PENDING'
            }
        });
        return res.status(201).json({ success: true, data: returnReq, message: 'Return request initiated.' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.initiateReturn = initiateReturn;
// ─── Admin/Vendor: Get all Return Requests ────────────────────────────────────
const getReturnRequests = async (req, res) => {
    try {
        // In a real app, filter by vendorId if it's a vendor. For admin, get all.
        const returns = await prisma_1.default.returnRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { order: { select: { id: true, total: true } }, vendor: { select: { companyName: true } } }
        });
        return res.json({ success: true, data: returns });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getReturnRequests = getReturnRequests;
// ─── Admin/Vendor: Update Return Status ───────────────────────────────────────
const updateReturnStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const returnReq = await prisma_1.default.returnRequest.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        return res.json({ success: true, data: returnReq });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateReturnStatus = updateReturnStatus;
//# sourceMappingURL=returns.controller.js.map