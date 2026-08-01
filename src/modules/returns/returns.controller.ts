import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Customer: Initiate a Return Request ──────────────────────────────────────
export const initiateReturn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { orderId, reason } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ success: false, message: 'orderId and reason are required' });
    }

    // Verify order belongs to user and is delivered (in real scenario check order status)
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { user: true, items: true }
    });

    if (!order || order.userId !== userId || order.items.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or not eligible for return' });
    }

    const vendorId = order.items[0]?.vendorId || 1;

    const returnReq = await prisma.returnRequest.create({
      data: {
        vendorId,
        orderId: order.id,
        customerName: order.user?.name || 'Customer',
        reason,
        amount: order.total, // Returning full amount for simplicity
        status: 'PENDING'
      }
    });

    return res.status(201).json({ success: true, data: returnReq, message: 'Return request initiated.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin/Vendor: Get all Return Requests ────────────────────────────────────
export const getReturnRequests = async (req: Request, res: Response) => {
  try {
    // In a real app, filter by vendorId if it's a vendor. For admin, get all.
    const returns = await prisma.returnRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { id: true, total: true } }, vendor: { select: { companyName: true } } }
    });
    return res.json({ success: true, data: returns });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin/Vendor: Update Return Status ───────────────────────────────────────
export const updateReturnStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const returnReq = await prisma.returnRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    return res.json({ success: true, data: returnReq });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
