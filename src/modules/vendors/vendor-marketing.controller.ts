import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Coupons & Combos ────────────────────────────────────────────────────────
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const coupons = await prisma.coupon.findMany({
      where: { vendorId },
      orderBy: { id: 'desc' }
    });

    res.status(200).json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { code, type, value, minOrderValue, maxUses, expiresAt } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        vendorId,
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Flash Sales ─────────────────────────────────────────────────────────────
export const getFlashSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const sales = await prisma.vendorFlashSale.findMany({
      where: { vendorId },
      include: { product: { select: { name: true, price: true } } },
      orderBy: { startTime: 'desc' }
    });

    res.status(200).json({ success: true, data: sales });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { productId, discountPercent, startTime, endTime } = req.body;

    const sale = await prisma.vendorFlashSale.create({
      data: {
        vendorId,
        productId: parseInt(productId, 10),
        discountPercent: parseFloat(discountPercent),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }
    });

    res.status(201).json({ success: true, data: sale });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Ad Campaigns ────────────────────────────────────────────────────────────
export const getAdCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const ads = await prisma.vendorAdCampaign.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: ads });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { type, targetProductId, dailyBudget, startDate, endDate } = req.body;

    const ad = await prisma.vendorAdCampaign.create({
      data: {
        vendorId,
        type,
        targetProductId: targetProductId ? parseInt(targetProductId, 10) : null,
        dailyBudget: parseFloat(dailyBudget),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }
    });

    res.status(201).json({ success: true, data: ad });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Email Campaigns ─────────────────────────────────────────────────────────
export const getEmailCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const emails = await prisma.vendorEmailCampaign.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: emails });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmailCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { subject, content, targetAudience, scheduledFor } = req.body;

    const email = await prisma.vendorEmailCampaign.create({
      data: {
        vendorId,
        subject,
        content,
        targetAudience,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      }
    });

    res.status(201).json({ success: true, data: email });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
