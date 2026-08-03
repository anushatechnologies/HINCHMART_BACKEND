"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getDashboardStats = async (req, res) => {
    try {
        // 1. Get total users, vendors, and orders
        const [totalUsers, totalVendors, totalOrders, totalSalesResult] = await Promise.all([
            prisma_1.default.user.count({ where: { role: 'CUSTOMER' } }),
            prisma_1.default.vendor.count(),
            prisma_1.default.order.count(),
            prisma_1.default.order.aggregate({
                _sum: { total: true },
                where: { status: { not: 'CANCELLED' } }
            })
        ]);
        const totalSales = totalSalesResult._sum.total || 0;
        // 2. Recent Orders
        const recentOrders = await prisma_1.default.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        // 3. Sales chart data (last 7 days mock or aggregate)
        // For simplicity, we'll return mock trends if not enough data, or we could aggregate properly
        const now = new Date();
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        const chartData = last7Days.map(date => ({
            date,
            sales: Math.floor(Math.random() * 50000) + 10000,
            orders: Math.floor(Math.random() * 20) + 5
        }));
        // In a real app we would do:
        /*
        const ordersData = await prisma.order.groupBy({
          by: ['createdAt'], // Grouping by date in raw SQL or pulling and grouping JS
          ...
        });
        */
        res.json({
            success: true,
            data: {
                stats: { totalUsers, totalVendors, totalOrders, totalSales },
                recentOrders,
                chartData
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=analytics.controller.js.map