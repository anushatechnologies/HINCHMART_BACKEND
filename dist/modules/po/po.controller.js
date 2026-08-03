"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePOStatus = exports.getAllPOs = exports.uploadPO = exports.getMyPOs = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const notifications_1 = require("../../utils/notifications");
const getMyPOs = async (req, res) => {
    try {
        const user = req.user;
        if (!user.companyId) {
            res.status(403).json({ success: false, message: 'Not linked to a B2B company' });
            return;
        }
        const pos = await prisma_1.default.purchaseOrder.findMany({
            where: { companyId: user.companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } }
            }
        });
        res.status(200).json({ success: true, data: pos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyPOs = getMyPOs;
const uploadPO = async (req, res) => {
    try {
        const user = req.user;
        if (!user.companyId) {
            res.status(403).json({ success: false, message: 'Not linked to a B2B company' });
            return;
        }
        const { poNumber, amount } = req.body;
        const file = req.file;
        if (!file || !poNumber || !amount) {
            res.status(400).json({ success: false, message: 'PO Number, Amount and Document are required' });
            return;
        }
        const po = await prisma_1.default.purchaseOrder.create({
            data: {
                poNumber,
                amount: parseFloat(amount),
                documentUrl: file.path,
                companyId: user.companyId,
                userId: user.id
            }
        });
        res.status(201).json({ success: true, data: po });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadPO = uploadPO;
const getAllPOs = async (req, res) => {
    try {
        const pos = await prisma_1.default.purchaseOrder.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                company: true,
                user: { select: { name: true, email: true } },
                orders: true
            }
        });
        res.status(200).json({ success: true, data: pos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllPOs = getAllPOs;
const updatePOStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        const po = await prisma_1.default.purchaseOrder.update({
            where: { id },
            data: { status },
            include: { user: true, company: true }
        });
        // Generate actual Order if approved
        if (status === 'APPROVED') {
            // Create a dummy order linked to this PO
            // In a real system, the PO would also detail the items. 
            // For MVP, we will create an empty/dummy order or assume they have a cart.
            // Let's create an order for the PO amount.
            // Fetch some generic address from user or company for shipping
            const address = await prisma_1.default.address.findFirst({ where: { userId: po.userId } });
            if (address) {
                const order = await prisma_1.default.order.create({
                    data: {
                        userId: po.userId,
                        companyId: po.companyId,
                        addressId: address.id,
                        total: po.amount,
                        subtotal: po.amount,
                        tax: 0,
                        paymentMethod: 'CORPORATE_CREDIT',
                        status: 'PLACED',
                        paymentStatus: 'CREDIT',
                        isCreditPurchase: true,
                        purchaseOrderId: po.id,
                        orderNumber: `ORD-PO-${Date.now().toString().slice(-6)}`
                    }
                });
                await notifications_1.NotificationService.sendShippingUpdate(po.user.email || '', po.user.phone || 'N/A', order.orderNumber, 'PLACED');
            }
        }
        res.status(200).json({ success: true, data: po });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updatePOStatus = updatePOStatus;
//# sourceMappingURL=po.controller.js.map