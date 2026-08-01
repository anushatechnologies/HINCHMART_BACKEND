import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Public: List active deals / offers ───────────────────────────────────────
export const getActiveDeals = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const deals = await prisma.deal.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        product: {
          include: { images: true, category: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    return res.json({ success: true, data: deals });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get all deals ─────────────────────────────────────────────────────
export const getAllDealsAdmin = async (req: Request, res: Response) => {
  try {
    const deals = await prisma.deal.findMany({
      include: { product: { select: { name: true, basePrice: true } } },
      orderBy: { id: 'desc' }
    });
    return res.json({ success: true, data: deals });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Create deal ───────────────────────────────────────────────────────
export const createDeal = async (req: Request, res: Response) => {
  try {
    const { productId, dealPrice, startTime, endTime } = req.body;
    if (!productId || !dealPrice || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const deal = await prisma.deal.create({
      data: {
        productId: parseInt(productId),
        dealPrice: parseFloat(dealPrice),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true
      },
      include: { product: { select: { name: true } } }
    });
    return res.status(201).json({ success: true, data: deal });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Update deal status ────────────────────────────────────────────────
export const updateDeal = async (req: Request, res: Response) => {
  try {
    const { dealPrice, startTime, endTime, isActive } = req.body;
    const deal = await prisma.deal.update({
      where: { id: parseInt(req.params.id) },
      data: {
        dealPrice: dealPrice ? parseFloat(dealPrice) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        isActive
      }
    });
    return res.json({ success: true, data: deal });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Delete deal ───────────────────────────────────────────────────────
export const deleteDeal = async (req: Request, res: Response) => {
  try {
    await prisma.deal.delete({ where: { id: parseInt(req.params.id) } });
    return res.json({ success: true, message: 'Deal deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
