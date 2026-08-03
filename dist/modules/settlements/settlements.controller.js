"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paySettlement = exports.getSettlements = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getSettlements = async (req, res) => {
    try {
        const user = req.user;
        const where = {};
        // Data isolation for vendors
        if (user?.role === 'VENDOR') {
            where.vendorId = user.id;
        }
        const settlements = await prisma_1.default.vendorSettlement.findMany({
            where,
            include: {
                vendor: { select: { companyName: true, contactEmail: true } },
                order: { select: { orderNumber: true, createdAt: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: settlements });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSettlements = getSettlements;
const paySettlement = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = req.user;
        // Only Admin can pay settlements
        if (user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        const settlement = await prisma_1.default.vendorSettlement.update({
            where: { id },
            data: {
                status: 'PAID',
                paidAt: new Date()
            }
        });
        res.status(200).json({ success: true, data: settlement });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.paySettlement = paySettlement;
//# sourceMappingURL=settlements.controller.js.map