import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import bcrypt from 'bcryptjs';

// GET /api/account/me
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, createdAt: true,
        _count: {
          select: { orders: true, wishlist: true, rfqs: true }
        }
      }
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/account/me
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, phone: true }
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/account/change-password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password_hash) {
      return res.status(400).json({ success: false, message: 'No password set. You use OTP login.' });
    }
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password_hash: hash } });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/account/dashboard
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const [orderStats, recentOrders, wishlistCount, rfqCount] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            take: 1,
            include: { variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.wishlistItem.count({ where: { userId } }),
      prisma.rfq.count({ where: { userId } }),
    ]);

    const totalSpent = orderStats.reduce((acc, s) => acc + (Number(s._sum.total) || 0), 0);
    const totalOrders = orderStats.reduce((acc, s) => acc + s._count.id, 0);

    res.json({
      success: true,
      data: {
        stats: { totalOrders, totalSpent, wishlistCount, rfqCount },
        orderStats,
        recentOrders,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/account/orders/:orderId
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { orderId } = req.params;
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), userId },
      include: {
        address: true,
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: { where: { isPrimary: true }, take: 1 } } }
              }
            }
          }
        },
        payments: true,
      }
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/account/orders/:orderId/cancel
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { orderId } = req.params;
    const order = await prisma.order.findFirst({
      where: { id: parseInt(orderId), userId }
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['PENDING', 'placed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }
    const updated = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'CANCELLED' }
    });
    res.json({ success: true, data: updated, message: 'Order cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
