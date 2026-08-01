import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getSettlements = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const where: any = {};

    // Data isolation for vendors
    if (user?.role === 'VENDOR') {
      where.vendorId = user.id;
    }

    const settlements = await prisma.vendorSettlement.findMany({
      where,
      include: {
        vendor: { select: { companyName: true, contactEmail: true } },
        order: { select: { orderNumber: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: settlements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const paySettlement = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = (req as any).user;

    // Only Admin can pay settlements
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const settlement = await prisma.vendorSettlement.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });

    res.status(200).json({ success: true, data: settlement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
