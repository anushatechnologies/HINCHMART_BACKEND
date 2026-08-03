"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.earnPoints = exports.getRewards = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const POINTS_PER_RUPEE = 1; // 1 point per ₹1 spent
const RUPEE_PER_POINT = 0.25; // 25 paise per point
// GET /api/rewards — get points balance + history
const getRewards = async (req, res) => {
    try {
        const userId = req.user.id;
        const rewards = await prisma_1.default.customerReward.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const totalEarned = rewards.filter(r => r.type === 'EARNED').reduce((acc, r) => acc + r.points, 0);
        const totalRedeemed = rewards.filter(r => r.type === 'REDEEMED').reduce((acc, r) => acc + r.points, 0);
        const balance = totalEarned - totalRedeemed;
        return res.json({
            success: true,
            data: {
                balance,
                totalEarned,
                totalRedeemed,
                walletValue: (balance * RUPEE_PER_POINT).toFixed(2),
                history: rewards,
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRewards = getRewards;
// POST /api/rewards/earn — earn points (called after successful order)
const earnPoints = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, amountSpent } = req.body;
        const points = Math.floor(Number(amountSpent) * POINTS_PER_RUPEE);
        const reward = await prisma_1.default.customerReward.create({
            data: {
                userId,
                points,
                reason: `Order #${orderId} purchase`,
                type: 'EARNED',
            },
        });
        return res.status(201).json({ success: true, data: reward, message: `You earned ${points} reward points!` });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.earnPoints = earnPoints;
//# sourceMappingURL=rewards.controller.js.map