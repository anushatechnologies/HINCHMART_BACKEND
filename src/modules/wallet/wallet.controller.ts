import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// GET /api/wallet — get balance + transaction history
export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await prisma.customerWalletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const balance = transactions.reduce((acc, t) => {
      return t.type === 'CREDIT' ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0);
    return res.json({ success: true, data: { balance: Math.max(0, balance), transactions } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/wallet/add-funds — add credits (would integrate with payment gateway)
export const addFunds = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, description } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const transaction = await prisma.customerWalletTransaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: 'CREDIT',
        description: description || 'Wallet Top-up',
        status: 'COMPLETED',
      },
    });
    return res.status(201).json({ success: true, data: transaction, message: 'Funds added successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
