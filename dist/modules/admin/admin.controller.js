"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemMetrics = exports.approveWalletTransaction = exports.getWalletTransactions = exports.triggerErpSync = exports.getDashboardChartData = exports.getCreditNotes = exports.getAllOrders = exports.updateOrderStatus = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const notifications_1 = require("../../utils/notifications");
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalOrders, ordersToday, totalRevenue, totalProducts] = await Promise.all([
            prisma_1.default.order.count(),
            prisma_1.default.order.count({ where: { createdAt: { gte: today } } }),
            prisma_1.default.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
            prisma_1.default.product.count()
        ]);
        // Fetch recent orders
        const recentOrders = await prisma_1.default.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json({
            success: true,
            data: {
                totalOrders,
                ordersToday,
                totalRevenue: totalRevenue._sum.total || 0,
                totalProducts,
                recentOrders
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma_1.default.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                user: true,
                items: { include: { variant: { include: { product: { include: { vendor: true } } } } } }
            }
        });
        // Phase 19: Commission Engine (Trigger on DELIVERED)
        if (status === 'DELIVERED') {
            for (const item of order.items) {
                const vendor = item.variant.product.vendor;
                if (vendor) {
                    // Check if settlement already exists to prevent duplicates
                    const existing = await prisma_1.default.vendorSettlement.findFirst({
                        where: { orderId: order.id, vendorId: vendor.id }
                    });
                    if (!existing) {
                        const grossAmount = Number(item.priceAtPurchase) * item.quantity;
                        const commissionRate = Number(vendor.commissionRate);
                        const commissionAmount = (grossAmount * commissionRate) / 100;
                        // Phase 23: Deduct 1% TDS as per Section 194-O
                        const tdsAmount = grossAmount * 0.01;
                        const netAmount = grossAmount - commissionAmount - tdsAmount;
                        await prisma_1.default.vendorSettlement.create({
                            data: {
                                vendorId: vendor.id,
                                orderId: order.id,
                                grossAmount,
                                commissionAmount,
                                tdsAmount,
                                netAmount,
                                status: 'PENDING'
                            }
                        });
                    }
                }
            }
        }
        // Phase 23: Handle Returns & Credit Notes
        if (status === 'RETURNED') {
            if (order.isCreditPurchase && order.companyId) {
                // Restore B2B Corporate Credit
                await prisma_1.default.company.update({
                    where: { id: order.companyId },
                    data: { availableCredit: { increment: order.total } }
                });
                // Generate Credit Note
                await prisma_1.default.creditNote.create({
                    data: {
                        companyId: order.companyId,
                        orderId: order.id,
                        amount: order.total,
                        reason: 'Order Returned'
                    }
                });
            }
        }
        await notifications_1.NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, status);
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                address: true,
                deliveryPartner: true,
                items: { include: { variant: { include: { product: true } } } }
            }
        });
        res.json({ success: true, data: orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllOrders = getAllOrders;
const getCreditNotes = async (req, res) => {
    try {
        const notes = await prisma_1.default.creditNote.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                company: true,
                order: { select: { orderNumber: true } }
            }
        });
        res.json({ success: true, data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCreditNotes = getCreditNotes;
const getDashboardChartData = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chartData = [];
        // Loop through the last 7 days
        for (let i = 6; i >= 0; i--) {
            const startOfDay = new Date(today);
            startOfDay.setDate(today.getDate() - i);
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(startOfDay.getDate() + 1);
            // Fetch aggregated data for that day
            const dailyStats = await prisma_1.default.order.aggregate({
                _sum: { total: true },
                _count: { id: true },
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lt: endOfDay
                    },
                    status: { not: 'CANCELLED' }
                }
            });
            const dayName = startOfDay.toLocaleDateString('en-US', { weekday: 'short' });
            chartData.push({
                name: dayName,
                revenue: dailyStats._sum.total ? parseFloat(dailyStats._sum.total.toString()) : 0,
                orders: dailyStats._count.id
            });
        }
        res.json({ success: true, data: chartData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardChartData = getDashboardChartData;
const triggerErpSync = async (req, res) => {
    try {
        const { system } = req.body;
        // Simulate a background job that actually syncs with SAP/Oracle
        // We would insert a job into a queue like BullMQ here
        res.json({ success: true, message: `ERP sync for ${system} initiated in the background` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.triggerErpSync = triggerErpSync;
const getWalletTransactions = async (req, res) => {
    try {
        const transactions = await prisma_1.default.customerWalletTransaction.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { companyName: true, name: true, id: true, companyId: true } }
            }
        });
        const mapped = transactions.map(t => ({
            id: `WTX-${t.id}`,
            originalId: t.id,
            user: t.user?.companyName || t.user?.name || 'Unknown User',
            userId: t.userId,
            companyId: t.user?.companyId,
            type: t.type,
            amount: Number(t.amount),
            // We will mock balance calculation for this response
            balance: t.status === 'COMPLETED' ? Number(t.amount) : 0,
            date: t.createdAt.toISOString(),
            status: t.status
        }));
        res.json({ success: true, data: mapped });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWalletTransactions = getWalletTransactions;
const approveWalletTransaction = async (req, res) => {
    try {
        const { id } = req.params; // format is WTX-123 or just 123
        const actualId = parseInt(id.replace('WTX-', ''));
        const transaction = await prisma_1.default.customerWalletTransaction.findUnique({
            where: { id: actualId },
            include: { user: true }
        });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        if (transaction.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: 'Transaction already completed' });
        }
        // Update transaction to COMPLETED
        await prisma_1.default.customerWalletTransaction.update({
            where: { id: actualId },
            data: { status: 'COMPLETED' }
        });
        // If B2B Corporate Credit, we can update Company availableCredit too
        if (transaction.user?.companyId && transaction.type === 'CREDIT') {
            await prisma_1.default.company.update({
                where: { id: transaction.user.companyId },
                data: { availableCredit: { increment: transaction.amount } }
            });
        }
        res.json({ success: true, message: 'Transaction approved successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.approveWalletTransaction = approveWalletTransaction;
const getSystemMetrics = async (req, res) => {
    try {
        const [totalVendors, totalProducts, totalOrders, totalUsers] = await Promise.all([
            prisma_1.default.vendor.count(),
            prisma_1.default.product.count(),
            prisma_1.default.order.count(),
            prisma_1.default.user.count()
        ]);
        const memory = process.memoryUsage();
        res.json({
            success: true,
            data: {
                system: {
                    uptimeSeconds: Math.floor(process.uptime()),
                    nodeVersion: process.version,
                    memoryHeapMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
                    memoryRssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
                },
                platform: {
                    totalVendors,
                    totalProducts,
                    totalOrders,
                    totalUsers
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSystemMetrics = getSystemMetrics;
//# sourceMappingURL=admin.controller.js.map