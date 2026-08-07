"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderItemStatus = exports.getVendorOrderDetails = exports.getVendorOrders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.user?.id || parseInt(req.query.vendorId, 10);
        const status = req.query.status;
        let whereClause = {};
        if (vendorId && !isNaN(vendorId)) {
            whereClause.vendorId = vendorId;
        }
        if (status) {
            whereClause.status = status;
        }
        const orderItems = await prisma.orderItem.findMany({
            where: whereClause,
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true } },
                        address: true
                    }
                },
                variant: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        res.status(200).json({ success: true, data: orderItems });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendor orders', error: error.message });
    }
};
exports.getVendorOrders = getVendorOrders;
const getVendorOrderDetails = async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: itemId },
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true } },
                        address: true,
                        payment: true
                    }
                },
                variant: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!orderItem) {
            res.status(404).json({ success: false, message: 'Order item not found' });
            return;
        }
        res.status(200).json({ success: true, data: orderItem });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch order details', error: error.message });
    }
};
exports.getVendorOrderDetails = getVendorOrderDetails;
const updateOrderItemStatus = async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const { status, trackingNumber, carrierName } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status value' });
            return;
        }
        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                status: status,
                ...(trackingNumber && { trackingNumber }),
                ...(carrierName && { courierName: carrierName })
            }
        });
        if (status === 'DELIVERED') {
            await prisma.$transaction(async (tx) => {
                const item = await tx.orderItem.findUnique({ where: { id: itemId } });
                if (!item)
                    return;
                const itemGross = Number(item.priceAtPurchase) * item.quantity;
                const commissionRate = 0.05; // 5%
                const commission = itemGross * commissionRate;
                const tds = itemGross * 0.01; // 1%
                const tcs = itemGross * 0.01; // 1%
                const itemNet = itemGross - commission - tds - tcs;
                const holdUntilDate = new Date();
                holdUntilDate.setDate(holdUntilDate.getDate() + 7);
                const vId = item.vendorId || 1;
                const existingEscrow = await tx.escrowHold.findFirst({
                    where: { orderId: item.orderId, vendorId: vId }
                });
                if (existingEscrow) {
                    await tx.escrowHold.update({
                        where: { id: existingEscrow.id },
                        data: {
                            grossAmount: Number(existingEscrow.grossAmount) + itemGross,
                            commissionAmount: Number(existingEscrow.commissionAmount) + commission,
                            tdsAmount: Number(existingEscrow.tdsAmount) + tds,
                            tcsAmount: Number(existingEscrow.tcsAmount) + tcs,
                            netPayoutAmount: Number(existingEscrow.netPayoutAmount) + itemNet,
                        }
                    });
                }
                else {
                    await tx.escrowHold.create({
                        data: {
                            vendorId: vId,
                            orderId: item.orderId,
                            grossAmount: itemGross,
                            commissionAmount: commission,
                            tdsAmount: tds,
                            tcsAmount: tcs,
                            netPayoutAmount: itemNet,
                            holdUntilDate: holdUntilDate,
                            escrowStatus: 'HELD'
                        }
                    });
                }
            });
        }
        res.status(200).json({ success: true, data: updatedItem, message: `Order item updated to ${status}` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
    }
};
exports.updateOrderItemStatus = updateOrderItemStatus;
//# sourceMappingURL=vendor-orders.controller.js.map