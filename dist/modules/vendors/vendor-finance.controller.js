"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaxReports = exports.getCreditNotes = exports.getInvoices = exports.getWalletLedger = exports.getFinanceOverview = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Wallet & Overview ───────────────────────────────────────────────────────
const getFinanceOverview = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        // 1. Get Live Wallet Balance (last transaction balance)
        const lastTx = await prisma.vendorWalletTransaction.findFirst({
            where: { vendorId },
            orderBy: { createdAt: 'desc' }
        });
        const walletBalance = lastTx ? Number(lastTx.balanceAfter) : 0;
        // 2. Calculate Total Revenue & Platform Fees (from completed settlements)
        const settlements = await prisma.vendorSettlement.findMany({
            where: { vendorId, status: 'COMPLETED' }
        });
        let totalSettled = 0;
        let platformFees = 0;
        for (const s of settlements) {
            totalSettled += Number(s.netAmount || 0); // Using netAmount based on existing schema
            platformFees += Number(s.commissionAmount || 0); // Using commissionAmount
        }
        // 3. Pending Settlements
        const pendingSettlements = await prisma.vendorSettlement.findMany({
            where: { vendorId, status: 'PENDING' }
        });
        const totalPending = pendingSettlements.reduce((sum, s) => sum + Number(s.netAmount || 0), 0);
        // 4. Generate Weekly Chart Data (Last 4 Weeks)
        const chartData = [];
        const today = new Date();
        for (let i = 3; i >= 0; i--) {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - (i * 7 + 7));
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() - (i * 7));
            let weekRev = 0;
            let weekProfit = 0;
            settlements.forEach(s => {
                const d = new Date(s.createdAt);
                if (d >= startOfWeek && d < endOfWeek) {
                    const rev = Number(s.netAmount || 0) + Number(s.commissionAmount || 0);
                    weekRev += rev;
                    weekProfit += Number(s.netAmount || 0);
                }
            });
            chartData.push({
                name: `Week ${4 - i}`,
                revenue: weekRev,
                profit: weekProfit
            });
        }
        res.status(200).json({
            success: true,
            data: {
                walletBalance,
                totalRevenue: totalSettled + platformFees,
                platformFees,
                netProfit: totalSettled,
                totalPending,
                chartData
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getFinanceOverview = getFinanceOverview;
const getWalletLedger = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const transactions = await prisma.vendorWalletTransaction.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.status(200).json({ success: true, data: transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWalletLedger = getWalletLedger;
// ─── Invoices ────────────────────────────────────────────────────────────────
const getInvoices = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const invoices = await prisma.vendorInvoice.findMany({
            where: { vendorId },
            include: { order: { select: { orderNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: invoices });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getInvoices = getInvoices;
// ─── Credit Notes ────────────────────────────────────────────────────────────
const getCreditNotes = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const notes = await prisma.vendorCreditNote.findMany({
            where: { vendorId },
            include: { order: { select: { orderNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCreditNotes = getCreditNotes;
// ─── Taxes & GST ─────────────────────────────────────────────────────────────
const getTaxReports = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        // Static aggregation logic representing monthly buckets
        const taxData = [
            { month: 'August 2026', cgst: 14500, sgst: 14500, igst: 3200, totalSales: 160000 },
            { month: 'July 2026', cgst: 12200, sgst: 12200, igst: 4100, totalSales: 145000 },
            { month: 'June 2026', cgst: 18000, sgst: 18000, igst: 1100, totalSales: 195000 },
        ];
        res.status(200).json({ success: true, data: taxData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTaxReports = getTaxReports;
//# sourceMappingURL=vendor-finance.controller.js.map