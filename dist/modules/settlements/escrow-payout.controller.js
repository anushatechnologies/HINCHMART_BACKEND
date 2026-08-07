"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTdsReport = exports.releaseEligibleEscrow = exports.getEscrowLedger = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
/**
 * Escrow Ledger - Get Vendor's Escrow Holds
 * GET /api/settlements/escrow
 */
const getEscrowLedger = async (req, res) => {
    try {
        const user = req.user;
        const where = {};
        if (user?.role === 'VENDOR') {
            where.vendorId = user.id;
        }
        else if (user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        const escrows = await prisma_1.default.escrowHold.findMany({
            where,
            include: {
                vendor: { select: { companyName: true, gstin: true, panNumber: true } },
                order: { select: { orderNumber: true, status: true, deliveredAt: true } }
            },
            orderBy: { holdUntilDate: 'asc' }
        });
        res.status(200).json({ success: true, data: escrows });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEscrowLedger = getEscrowLedger;
/**
 * Release Eligible Escrow Holds (Admin)
 * POST /api/admin/escrow/release
 */
const releaseEligibleEscrow = async (req, res) => {
    try {
        const user = req.user;
        if (user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        const { escrowIds } = req.body;
        if (!escrowIds || !Array.isArray(escrowIds) || escrowIds.length === 0) {
            res.status(400).json({ success: false, message: 'escrowIds array is required' });
            return;
        }
        // Generate a payout batch ID
        const payoutBatchId = `PAYOUT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const result = await prisma_1.default.escrowHold.updateMany({
            where: {
                id: { in: escrowIds },
                escrowStatus: 'HELD',
            },
            data: {
                escrowStatus: 'RELEASED',
                payoutBatchId: payoutBatchId,
            }
        });
        // In a real system, you would integrate with RazorpayX or Stripe Connect here to trigger the actual bank transfer
        // using the sum(netPayoutAmount) grouped by vendorId.
        res.status(200).json({
            success: true,
            message: `${result.count} escrow holds successfully released.`,
            data: { payoutBatchId, releasedCount: result.count }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.releaseEligibleEscrow = releaseEligibleEscrow;
/**
 * Generate TDS/TCS Report (Admin)
 * GET /api/admin/tax/tds-report
 */
const generateTdsReport = async (req, res) => {
    try {
        const user = req.user;
        if (user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        // Aggregate TDS and TCS data grouped by vendor
        const aggregation = await prisma_1.default.escrowHold.groupBy({
            by: ['vendorId'],
            _sum: {
                grossAmount: true,
                commissionAmount: true,
                tdsAmount: true,
                tcsAmount: true,
                netPayoutAmount: true,
            },
            where: {
                escrowStatus: 'RELEASED' // Only report on released payouts
            }
        });
        const vendorIds = aggregation.map(a => a.vendorId);
        // Fetch vendor details
        const vendors = await prisma_1.default.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, companyName: true, panNumber: true, gstin: true }
        });
        const vendorMap = new Map(vendors.map(v => [v.id, v]));
        const report = aggregation.map(a => ({
            vendor: vendorMap.get(a.vendorId),
            totals: {
                grossAmount: a._sum.grossAmount,
                commissionAmount: a._sum.commissionAmount,
                tdsAmount: a._sum.tdsAmount,
                tcsAmount: a._sum.tcsAmount,
                netPayoutAmount: a._sum.netPayoutAmount,
            }
        }));
        res.status(200).json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.generateTdsReport = generateTdsReport;
//# sourceMappingURL=escrow-payout.controller.js.map