"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPOD = exports.delhiveryWebhook = exports.assignDelivery = exports.createPartner = exports.getPartners = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const notifications_1 = require("../../utils/notifications");
const getPartners = async (req, res) => {
    try {
        const partners = await prisma_1.default.deliveryPartner.findMany({
            include: {
                _count: {
                    select: { orders: { where: { status: 'OUT_FOR_DELIVERY' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: partners });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPartners = getPartners;
const createPartner = async (req, res) => {
    try {
        const { name, phone, vehicleNumber } = req.body;
        if (!name || !phone) {
            res.status(400).json({ success: false, message: 'Name and phone are required' });
            return;
        }
        const partner = await prisma_1.default.deliveryPartner.create({
            data: { name, phone, vehicleNumber }
        });
        res.status(201).json({ success: true, data: partner });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createPartner = createPartner;
const assignDelivery = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { deliveryPartnerId } = req.body;
        const order = await prisma_1.default.order.update({
            where: { id },
            data: {
                deliveryPartnerId: parseInt(deliveryPartnerId),
                status: 'OUT_FOR_DELIVERY'
            },
            include: { user: true }
        });
        await notifications_1.NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, 'OUT_FOR_DELIVERY');
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.assignDelivery = assignDelivery;
const delhiveryWebhook = async (req, res) => {
    try {
        const { orderNumber, trackingStatus } = req.body;
        if (!orderNumber || !trackingStatus) {
            res.status(400).json({ success: false, message: 'orderNumber and trackingStatus are required.' });
            return;
        }
        const validStatuses = ['PLACED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(trackingStatus.toUpperCase())) {
            res.status(400).json({ success: false, message: 'Invalid tracking status.' });
            return;
        }
        const order = await prisma_1.default.order.findUnique({
            where: { orderNumber },
            include: { user: true }
        });
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        await prisma_1.default.order.update({
            where: { id: order.id },
            data: { status: trackingStatus.toUpperCase() }
        });
        // Send email notification to the customer automatically!
        await notifications_1.NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, trackingStatus.toUpperCase());
        res.status(200).json({ success: true, message: 'Tracking status updated and customer notified.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.delhiveryWebhook = delhiveryWebhook;
const uploadPOD = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, message: 'No POD image uploaded' });
            return;
        }
        // First fetch the order to trigger the commission engine if we update status to DELIVERED
        const order = await prisma_1.default.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: { include: { variant: { include: { product: { include: { vendor: true } } } } } }
            }
        });
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        // Trigger Commission Engine (from Phase 19)
        for (const item of order.items) {
            const vendor = item.variant.product.vendor;
            if (vendor) {
                const existing = await prisma_1.default.vendorSettlement.findFirst({
                    where: { orderId: order.id, vendorId: vendor.id }
                });
                if (!existing) {
                    const grossAmount = Number(item.priceAtPurchase) * item.quantity;
                    const commissionRate = Number(vendor.commissionRate);
                    const commissionAmount = (grossAmount * commissionRate) / 100;
                    const netAmount = grossAmount - commissionAmount;
                    await prisma_1.default.vendorSettlement.create({
                        data: {
                            vendorId: vendor.id,
                            orderId: order.id,
                            grossAmount,
                            commissionAmount,
                            netAmount,
                            status: 'PENDING'
                        }
                    });
                }
            }
        }
        // Update order with POD and DELIVERED status
        const updatedOrder = await prisma_1.default.order.update({
            where: { id },
            data: {
                podImageUrl: file.path,
                status: 'DELIVERED',
                deliveredAt: new Date()
            }
        });
        await notifications_1.NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, 'DELIVERED');
        res.status(200).json({ success: true, data: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadPOD = uploadPOD;
//# sourceMappingURL=logistics.controller.js.map