import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

const POINTS_PER_RUPEE = 1; // 1 point per ₹1 spent
const RUPEE_PER_POINT = 0.25; // 25 paise per point

// GET /api/rewards — get points balance + history
export const getRewards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rewards = await prisma.customerReward.findMany({
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/rewards/earn — earn points (called after successful order)
export const earnPoints = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { orderId, amountSpent } = req.body;
    const points = Math.floor(Number(amountSpent) * POINTS_PER_RUPEE);
    const reward = await prisma.customerReward.create({
      data: {
        userId,
        points,
        reason: `Order #${orderId} purchase`,
        type: 'EARNED',
      },
    });
    return res.status(201).json({ success: true, data: reward, message: `You earned ${points} reward points!` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
