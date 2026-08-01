import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Storefront: Get approved reviews + rating summary for a product ──────────
export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, slug: true, brand: true, images: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const pid = parseInt(productId);

    const [reviews, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { productId: pid, isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { id: 'desc' }
      }),
      prisma.review.aggregate({
        where: { productId: pid, isApproved: true },
        _avg: { rating: true },
        _count: { id: true }
      })
    ]);

    res.json({
      success: true,
      data: reviews,
      summary: {
        averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0,
        totalReviews: aggregate._count.id
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Storefront: Submit review (verified buyers only) ─────────────────────────
export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const pid = parseInt(productId);

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({ where: { userId, productId: pid } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    // Verified purchase check — user must have a delivered order containing this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        variant: { productId: pid },
        order: { userId, status: { in: ['delivered', 'placed', 'shipped'] } }
      }
    });
    const isVerified = !!purchase;

    const review = await prisma.review.create({
      data: {
        userId,
        productId: pid,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment,
        isApproved: false // Requires admin approval
      }
    });
    res.status(201).json({
      success: true,
      data: { ...review, isVerifiedPurchase: isVerified },
      message: 'Review submitted and pending approval.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Get ALL reviews (pending + approved) ──────────────────────────────
export const getAllReviewsAdmin = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Approve or reject a review ───────────────────────────────────────
export const updateReviewStatusAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { isApproved }
    });
    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Delete a review ───────────────────────────────────────────────────
export const deleteReviewAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
