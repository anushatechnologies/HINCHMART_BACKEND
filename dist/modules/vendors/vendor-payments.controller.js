"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestManualPayout = exports.linkRazorpayAccount = exports.getSettlementsLedger = exports.getPayoutsOverview = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// In a real app, you would integrate Razorpay Node SDK here
// import Razorpay from 'razorpay';
// const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const getPayoutsOverview = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        // Aggregate pending and paid settlements
        const stats = await prisma.vendorSettlement.groupBy({
            by: ['status'],
            where: { vendorId },
            _sum: { netAmount: true }
        });
        let nextPayout = 0;
        let totalSettled = 0;
        stats.forEach(stat => {
            if (stat.status === 'PENDING')
                nextPayout = Number(stat._sum.netAmount) || 0;
            if (stat.status === 'PAID')
                totalSettled = Number(stat._sum.netAmount) || 0;
        });
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { razorpayAccountId: true, bankAccountNumber: true, bankName: true, ifscCode: true }
        });
        res.status(200).json({
            success: true,
            data: {
                nextPayout,
                totalSettled,
                razorpayAccountId: vendor?.razorpayAccountId,
                bankDetails: {
                    account: vendor?.bankAccountNumber,
                    bank: vendor?.bankName,
                    ifsc: vendor?.ifscCode
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPayoutsOverview = getPayoutsOverview;
const getSettlementsLedger = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const settlements = await prisma.vendorSettlement.findMany({
            where: { vendorId },
            include: { order: { select: { orderNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: settlements });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSettlementsLedger = getSettlementsLedger;
const linkRazorpayAccount = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        const { bankAccountNumber, ifscCode, bankName } = req.body;
        if (!bankAccountNumber || !ifscCode) {
            res.status(400).json({ success: false, message: 'Bank details required to create Razorpay account' });
            return;
        }
        // In a real app, you would call:
        // const rzpAcc = await razorpay.accounts.create({ ... })
        // For this MVP, we simulate a successful linked account creation.
        const mockRazorpayAccId = `acc_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const vendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: {
                bankAccountNumber,
                ifscCode,
                bankName,
                razorpayAccountId: mockRazorpayAccId
            }
        });
        res.status(200).json({
            success: true,
            message: 'Razorpay Linked Account created successfully',
            data: { razorpayAccountId: mockRazorpayAccId }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.linkRazorpayAccount = linkRazorpayAccount;
const requestManualPayout = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        // Find all pending settlements
        const pendingSettlements = await prisma.vendorSettlement.findMany({
            where: { vendorId, status: 'PENDING' }
        });
        if (pendingSettlements.length === 0) {
            res.status(400).json({ success: false, message: 'No pending settlements available for payout' });
            return;
        }
        // Simulate Razorpay payout creation
        const mockPayoutId = `pout_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        // Update settlements to PAID
        await prisma.vendorSettlement.updateMany({
            where: { vendorId, status: 'PENDING' },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                payoutId: mockPayoutId
            }
        });
        res.status(200).json({
            success: true,
            message: `Payout ${mockPayoutId} initiated successfully via Razorpay`
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestManualPayout = requestManualPayout;
//# sourceMappingURL=vendor-payments.controller.js.map