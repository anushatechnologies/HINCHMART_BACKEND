"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.getOrderById = exports.getDashboard = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// GET /api/account/me
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, email: true, phone: true,
                role: true, status: true, createdAt: true,
                _count: {
                    select: { orders: true, wishlist: true, rfqs: true }
                }
            }
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProfile = getProfile;
// PUT /api/account/me
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: { name, email },
            select: { id: true, name: true, email: true, phone: true }
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProfile = updateProfile;
// PUT /api/account/change-password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user?.password_hash) {
            return res.status(400).json({ success: false, message: 'No password set. You use OTP login.' });
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!valid)
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        const hash = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({ where: { id: userId }, data: { password_hash: hash } });
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.changePassword = changePassword;
// GET /api/account/dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const [orderStats, recentOrders, wishlistCount, rfqCount] = await Promise.all([
            prisma_1.default.order.groupBy({
                by: ['status'],
                where: { userId },
                _count: { id: true },
                _sum: { total: true },
            }),
            prisma_1.default.order.findMany({
                where: { userId },
                include: {
                    items: {
                        take: 1,
                        include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            prisma_1.default.wishlistItem.count({ where: { userId } }),
            prisma_1.default.rfq.count({ where: { userId } }),
        ]);
        const totalSpent = orderStats.reduce((acc, s) => acc + (Number(s._sum.total) || 0), 0);
        const totalOrders = orderStats.reduce((acc, s) => acc + s._count.id, 0);
        res.json({
            success: true,
            data: {
                stats: { totalOrders, totalSpent, wishlistCount, rfqCount },
                orderStats,
                recentOrders,
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboard = getDashboard;
// GET /api/account/orders/:orderId
const getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const order = await prisma_1.default.order.findFirst({
            where: { id: parseInt(orderId), userId },
            include: {
                address: true,
                items: {
                    include: {
                        variant: {
                            include: {
                                product: { include: { images: { where: { isPrimary: true }, take: 1 } } }
                            }
                        }
                    }
                },
                payments: true,
            }
        });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getOrderById = getOrderById;
// POST /api/account/orders/:orderId/cancel
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const order = await prisma_1.default.order.findFirst({
            where: { id: parseInt(orderId), userId }
        });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        if (!['PENDING', 'placed'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
        }
        const updated = await prisma_1.default.order.update({
            where: { id: parseInt(orderId) },
            data: { status: 'CANCELLED' }
        });
        res.json({ success: true, data: updated, message: 'Order cancelled successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=account.controller.js.map