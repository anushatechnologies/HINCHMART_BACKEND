"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFunds = exports.getWallet = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// GET /api/wallet — get balance + transaction history
const getWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await prisma_1.default.customerWalletTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const balance = transactions.reduce((acc, t) => {
            return t.type === 'CREDIT' ? acc + Number(t.amount) : acc - Number(t.amount);
        }, 0);
        return res.json({ success: true, data: { balance: Math.max(0, balance), transactions } });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getWallet = getWallet;
// POST /api/wallet/add-funds — add credits (would integrate with payment gateway)
const addFunds = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, description } = req.body;
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }
        const transaction = await prisma_1.default.customerWalletTransaction.create({
            data: {
                userId,
                amount: parseFloat(amount),
                type: 'CREDIT',
                description: description || 'Wallet Top-up',
                status: 'COMPLETED',
            },
        });
        return res.status(201).json({ success: true, data: transaction, message: 'Funds added successfully!' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.addFunds = addFunds;
//# sourceMappingURL=wallet.controller.js.map