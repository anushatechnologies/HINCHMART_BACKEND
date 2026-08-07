"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsDashboard = exports.getSalesDashboard = exports.getDashboardHome = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper to format currency
const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;
const getDashboardHome = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'Invalid vendor ID' });
            return;
        }
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId }
        });
        // 1. Fetch KPI Data
        const orderItems = await prisma.orderItem.findMany({
            where: { vendorId },
            include: {
                order: { select: { orderNumber: true, createdAt: true, user: { select: { name: true, companyName: true } } } },
                variant: { include: { product: { select: { name: true, stockStatus: true } } } }
            }
        });
        let totalRevenue = 0;
        const orderIds = new Set();
        let pendingOrders = 0;
        orderItems.forEach(item => {
            totalRevenue += Number(item.priceAtPurchase) * item.quantity;
            orderIds.add(item.orderId);
            if (item.status === 'PENDING')
                pendingOrders++;
        });
        const activeProducts = await prisma.product.count({
            where: { vendorId, isActive: true }
        });
        // Sparkline Trends (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrderItems = await prisma.orderItem.findMany({
            where: { vendorId, order: { createdAt: { gte: sevenDaysAgo } } },
            include: { order: { select: { createdAt: true } } }
        });
        const revenueSparkline = new Array(7).fill(0);
        const ordersSparkline = new Array(7).fill(0);
        const today = new Date();
        recentOrderItems.forEach(item => {
            const d = item.order.createdAt;
            const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 3600 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                revenueSparkline[6 - diffDays] += Number(item.priceAtPurchase) * item.quantity;
                ordersSparkline[6 - diffDays] += 1;
            }
        });
        const formatSparkline = (arr) => arr.map(value => ({ value }));
        // 2. Recent Orders (unique orders)
        const recentOrdersRaw = await prisma.order.findMany({
            where: { items: { some: { vendorId } } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                user: { select: { name: true, companyName: true } },
                items: { where: { vendorId } }
            }
        });
        const recentOrders = recentOrdersRaw.map(o => {
            const vendorItems = o.items;
            const orderAmount = vendorItems.reduce((sum, i) => sum + (Number(i.priceAtPurchase) * i.quantity), 0);
            return {
                id: o.orderNumber,
                customer: o.companyName || o.user.name || 'Customer',
                amount: formatCurrency(orderAmount),
                status: vendorItems[0]?.status || 'PENDING',
                date: o.createdAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
            };
        });
        // 3. Top Products
        const productSales = {};
        orderItems.forEach(item => {
            const pid = item.variant.productId;
            if (!productSales[pid]) {
                productSales[pid] = {
                    name: item.variant.product.name,
                    sales: 0,
                    revenue: 0,
                    stock: item.variant.stockQty
                };
            }
            productSales[pid].sales += item.quantity;
            productSales[pid].revenue += Number(item.priceAtPurchase) * item.quantity;
        });
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 4)
            .map(p => ({
            ...p,
            revenue: formatCurrency(p.revenue)
        }));
        res.status(200).json({
            success: true,
            data: {
                kpis: {
                    totalRevenue: formatCurrency(totalRevenue),
                    totalOrders: orderIds.size,
                    activeProducts,
                    pendingOrders
                },
                trends: {
                    revenue: formatSparkline(revenueSparkline),
                    orders: formatSparkline(ordersSparkline),
                    products: [{ value: activeProducts }], // Flat line for now
                    pending: [{ value: pendingOrders }] // Flat line for now
                },
                recentOrders,
                topProducts,
                vendorProfile: vendor
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch home dashboard', error: error.message });
    }
};
exports.getDashboardHome = getDashboardHome;
const getSalesDashboard = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { commissionRate: true } });
        const commRate = Number(vendor?.commissionRate || 10);
        const orderItems = await prisma.orderItem.findMany({
            where: { vendorId },
            include: {
                order: { select: { orderNumber: true, createdAt: true, isCreditPurchase: true, user: { select: { name: true, companyName: true } } } }
            }
        });
        let grossRevenue = 0;
        let b2bRev = 0, creditRev = 0, marketRev = 0;
        // Monthly aggregation
        const monthlyRev = new Array(7).fill(0);
        const currentMonth = new Date().getMonth();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthLabels = [];
        for (let i = 6; i >= 0; i--) {
            let m = currentMonth - i;
            if (m < 0)
                m += 12;
            monthLabels.push(months[m]);
        }
        // Weekly aggregation (last 7 days)
        const weeklyStats = [
            { day: 'Mon', revenue: 0 }, { day: 'Tue', revenue: 0 }, { day: 'Wed', revenue: 0 },
            { day: 'Thu', revenue: 0 }, { day: 'Fri', revenue: 0 }, { day: 'Sat', revenue: 0 }, { day: 'Sun', revenue: 0 }
        ];
        orderItems.forEach(item => {
            const rev = Number(item.priceAtPurchase) * item.quantity;
            grossRevenue += rev;
            // Channels
            if (item.order.isCreditPurchase)
                creditRev += rev;
            else if (item.order.user.companyName)
                b2bRev += rev;
            else
                marketRev += rev;
            // Monthly
            const d = new Date(item.order.createdAt);
            let mDiff = currentMonth - d.getMonth();
            if (mDiff < 0)
                mDiff += 12;
            if (mDiff < 7) {
                monthlyRev[6 - mDiff] += rev;
            }
            // Weekly
            const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0, Sun=6
            weeklyStats[dayIndex].revenue += rev;
        });
        const uniqueOrders = new Set(orderItems.map(i => i.orderId)).size;
        const netRevenue = grossRevenue * (1 - commRate / 100);
        const aov = uniqueOrders > 0 ? grossRevenue / uniqueOrders : 0;
        const channels = [
            { label: 'B2B Direct', percentage: grossRevenue ? Math.round((b2bRev / grossRevenue) * 100) : 0 },
            { label: 'Credit Orders', percentage: grossRevenue ? Math.round((creditRev / grossRevenue) * 100) : 0 },
            { label: 'Marketplace', percentage: grossRevenue ? Math.round((marketRev / grossRevenue) * 100) : 0 },
        ];
        // Recent Sales
        const recentOrdersRaw = await prisma.order.findMany({
            where: { items: { some: { vendorId } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: { select: { name: true, companyName: true } },
                items: { where: { vendorId } }
            }
        });
        const recentSales = recentOrdersRaw.map(o => {
            const vendorItems = o.items;
            const orderAmount = vendorItems.reduce((sum, i) => sum + (Number(i.priceAtPurchase) * i.quantity), 0);
            const commission = orderAmount * (commRate / 100);
            return {
                id: o.orderNumber,
                customer: o.companyName || o.user.name || 'Customer',
                products: vendorItems.reduce((sum, i) => sum + i.quantity, 0),
                amount: formatCurrency(orderAmount),
                commission: formatCurrency(commission),
                net: formatCurrency(orderAmount - commission),
                date: o.createdAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
            };
        });
        res.status(200).json({
            success: true,
            data: {
                kpis: {
                    grossRevenue: formatCurrency(grossRevenue),
                    netRevenue: formatCurrency(netRevenue),
                    aov: formatCurrency(Math.round(aov)),
                    conversionRate: "3.8%" // mock conversion as we dont track visits yet
                },
                monthlyLabels: monthLabels,
                monthlyData: monthlyRev,
                channels,
                weeklyStats,
                recentSales
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch sales dashboard', error: error.message });
    }
};
exports.getSalesDashboard = getSalesDashboard;
const getAnalyticsDashboard = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        const orderItems = await prisma.orderItem.findMany({
            where: { vendorId },
            include: { variant: { include: { product: { include: { category: true } } } } }
        });
        const categoryStats = {};
        orderItems.forEach(item => {
            const cat = item.variant.product.category.name;
            if (!categoryStats[cat])
                categoryStats[cat] = { revenue: 0, units: 0 };
            categoryStats[cat].revenue += Number(item.priceAtPurchase) * item.quantity;
            categoryStats[cat].units += item.quantity;
        });
        const categories = Object.entries(categoryStats).map(([name, stats]) => ({
            name,
            ...stats
        })).sort((a, b) => b.revenue - a.revenue);
        res.status(200).json({
            success: true,
            data: {
                categories
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch analytics dashboard', error: error.message });
    }
};
exports.getAnalyticsDashboard = getAnalyticsDashboard;
//# sourceMappingURL=vendor-dashboard.controller.js.map