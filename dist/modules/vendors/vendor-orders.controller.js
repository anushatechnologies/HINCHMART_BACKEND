"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderItemStatus = exports.getVendorOrders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getVendorOrders = async (req, res) => {
    try {
        // Note: In a real implementation, you'd get the vendorId from req.user (JWT)
        // For MVP, we pass it via query param or header. Let's assume query for now, or token.
        // If we use JWT, we need authMiddleware. Let's mock with query `vendorId`.
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const orderItems = await prisma.orderItem.findMany({
            where: {
                vendorId: vendorId
            },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        createdAt: true,
                        status: true,
                        total: true,
                        companyName: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                companyName: true
                            }
                        }
                    }
                },
                variant: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                order: {
                    createdAt: 'desc'
                }
            }
        });
        res.status(200).json({
            success: true,
            data: orderItems
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendor orders', error: error.message });
    }
};
exports.getVendorOrders = getVendorOrders;
const updateOrderItemStatus = async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const { status, trackingNumber, courierName } = req.body;
        if (isNaN(itemId)) {
            res.status(400).json({ success: false, message: 'Invalid item ID' });
            return;
        }
        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId },
            data: {
                status,
                ...(trackingNumber && { trackingNumber }),
                ...(courierName && { courierName })
            }
        });
        res.status(200).json({
            success: true,
            message: 'Order item updated successfully',
            data: updatedItem
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order item', error: error.message });
    }
};
exports.updateOrderItemStatus = updateOrderItemStatus;
//# sourceMappingURL=vendor-orders.controller.js.map