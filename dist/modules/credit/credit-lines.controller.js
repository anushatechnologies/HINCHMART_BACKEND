"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewCreditLineAdmin = exports.getCreditLinesAdmin = exports.getCreditStatus = exports.applyCreditLine = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
/**
 * Corporate Buyer applies for Trade Credit Line (Net-30 / Net-60)
 * POST /api/credit/apply
 */
const applyCreditLine = async (req, res) => {
    try {
        const { userId, companyId, requestedCreditLimit, paymentTermsDays, gstin, panNumber, financialDocUrl } = req.body;
        if (!userId || !requestedCreditLimit) {
            res.status(400).json({ success: false, message: 'User ID and requested credit limit are required' });
            return;
        }
        const creditLine = await prisma_1.default.buyerCreditLine.create({
            data: {
                userId: Number(userId),
                companyId: companyId ? Number(companyId) : null,
                requestedCreditLimit: Number(requestedCreditLimit),
                paymentTermsDays: paymentTermsDays || 30,
                gstin,
                panNumber,
                financialDocUrl,
                creditStatus: 'PENDING'
            }
        });
        res.status(201).json({
            success: true,
            message: 'Credit line application submitted successfully',
            data: creditLine
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.applyCreditLine = applyCreditLine;
/**
 * Get Buyer Credit Line & Balance
 * GET /api/credit/status?userId=123
 */
const getCreditStatus = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(400).json({ success: false, message: 'userId query parameter is required' });
            return;
        }
        const creditLine = await prisma_1.default.buyerCreditLine.findFirst({
            where: { userId: Number(userId) },
            orderBy: { id: 'desc' }
        });
        if (!creditLine) {
            res.status(200).json({
                success: true,
                data: {
                    hasCreditLine: false,
                    creditStatus: 'NONE',
                    approvedCreditLimit: 0,
                    usedCreditLimit: 0,
                    availableCredit: 0
                }
            });
            return;
        }
        const approved = Number(creditLine.approvedCreditLimit);
        const used = Number(creditLine.usedCreditLimit);
        res.status(200).json({
            success: true,
            data: {
                hasCreditLine: true,
                id: creditLine.id,
                creditStatus: creditLine.creditStatus,
                paymentTermsDays: creditLine.paymentTermsDays,
                requestedCreditLimit: Number(creditLine.requestedCreditLimit),
                approvedCreditLimit: approved,
                usedCreditLimit: used,
                availableCredit: Math.max(0, approved - used),
                gstin: creditLine.gstin
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCreditStatus = getCreditStatus;
/**
 * Admin: Get List of Credit Applications
 * GET /api/admin/credit/applications
 */
const getCreditLinesAdmin = async (req, res) => {
    try {
        const applications = await prisma_1.default.buyerCreditLine.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true, companyName: true }
                }
            },
            orderBy: { id: 'desc' }
        });
        res.status(200).json({ success: true, data: applications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCreditLinesAdmin = getCreditLinesAdmin;
/**
 * Admin: Approve / Reject / Adjust Credit Line
 * PATCH /api/admin/credit/:id/review
 */
const reviewCreditLineAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { creditStatus, approvedCreditLimit, paymentTermsDays, adminNotes } = req.body;
        // creditStatus: 'ACTIVE' | 'SUSPENDED' | 'REJECTED'
        const updated = await prisma_1.default.buyerCreditLine.update({
            where: { id: Number(id) },
            data: {
                creditStatus,
                approvedCreditLimit: approvedCreditLimit ? Number(approvedCreditLimit) : undefined,
                paymentTermsDays: paymentTermsDays ? Number(paymentTermsDays) : undefined,
                adminNotes
            }
        });
        res.status(200).json({
            success: true,
            message: `Credit line application ${creditStatus}`,
            data: updated
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.reviewCreditLineAdmin = reviewCreditLineAdmin;
//# sourceMappingURL=credit-lines.controller.js.map