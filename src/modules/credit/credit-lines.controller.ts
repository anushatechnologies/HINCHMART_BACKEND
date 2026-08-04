import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

/**
 * Corporate Buyer applies for Trade Credit Line (Net-30 / Net-60)
 * POST /api/credit/apply
 */
export const applyCreditLine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, companyId, requestedCreditLimit, paymentTermsDays, gstin, panNumber, financialDocUrl } = req.body;

    if (!userId || !requestedCreditLimit) {
      res.status(400).json({ success: false, message: 'User ID and requested credit limit are required' });
      return;
    }

    const creditLine = await prisma.buyerCreditLine.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Buyer Credit Line & Balance
 * GET /api/credit/status?userId=123
 */
export const getCreditStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ success: false, message: 'userId query parameter is required' });
      return;
    }

    const creditLine = await prisma.buyerCreditLine.findFirst({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Get List of Credit Applications
 * GET /api/admin/credit/applications
 */
export const getCreditLinesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await prisma.buyerCreditLine.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, companyName: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: Approve / Reject / Adjust Credit Line
 * PATCH /api/admin/credit/:id/review
 */
export const reviewCreditLineAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { creditStatus, approvedCreditLimit, paymentTermsDays, adminNotes } = req.body;
    // creditStatus: 'ACTIVE' | 'SUSPENDED' | 'REJECTED'

    const updated = await prisma.buyerCreditLine.update({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
