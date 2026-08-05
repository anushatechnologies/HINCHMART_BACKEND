import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get products that are waiting for review
export const getPendingProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: {
        approvalStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] }
      },
      include: {
        vendor: { select: { companyName: true, contactEmail: true } },
        category: true,
        variants: true,
        images: true,
        documents: true,
        rentalDetails: true
      },
      orderBy: { createdAt: 'asc' }
    });
    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending products', error: error.message });
  }
};

// Review a product (Approve, Reject, or Request Changes)
export const reviewProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { action, comments } = req.body; // action: 'APPROVE', 'REJECT', 'REQUEST_CHANGES'

    if (!action) {
      res.status(400).json({ success: false, message: 'Action is required' });
      return;
    }

    let status = '';
    if (action === 'APPROVE') status = 'APPROVED';
    else if (action === 'REJECT') status = 'REJECTED';
    else if (action === 'REQUEST_CHANGES') status = 'CHANGES_REQUIRED';
    else {
      res.status(400).json({ success: false, message: 'Invalid action' });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: { approvalStatus: status }
      // In a real system, you might save the `comments` to a ProductReviewLog or AuditLog table here.
    });

    res.status(200).json({ success: true, message: `Product status updated to ${status}`, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to review product', error: error.message });
  }
};
