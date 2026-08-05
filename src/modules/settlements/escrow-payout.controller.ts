import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { Prisma } from '@prisma/client';

/**
 * Escrow Ledger - Get Vendor's Escrow Holds
 * GET /api/settlements/escrow
 */
export const getEscrowLedger = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const where: any = {};

    if (user?.role === 'VENDOR') {
      where.vendorId = user.id;
    } else if (user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const escrows = await prisma.escrowHold.findMany({
      where,
      include: {
        vendor: { select: { companyName: true, gstin: true, panNumber: true } },
        order: { select: { orderNumber: true, status: true, deliveredAt: true } }
      },
      orderBy: { holdUntilDate: 'asc' }
    });

    res.status(200).json({ success: true, data: escrows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Release Eligible Escrow Holds (Admin)
 * POST /api/admin/escrow/release
 */
export const releaseEligibleEscrow = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
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

    const result = await prisma.escrowHold.updateMany({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generate TDS/TCS Report (Admin)
 * GET /api/admin/tax/tds-report
 */
export const generateTdsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    // Aggregate TDS and TCS data grouped by vendor
    const aggregation = await prisma.escrowHold.groupBy({
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
    const vendors = await prisma.vendor.findMany({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
