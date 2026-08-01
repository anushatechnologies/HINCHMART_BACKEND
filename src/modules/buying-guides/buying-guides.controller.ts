import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Public: List published guides ────────────────────────────────────────────
export const getBuyingGuides = async (req: Request, res: Response) => {
  try {
    const { category, page = '1', limit = '12' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { published: true };
    if (category) where.category = category;

    const [guides, total] = await Promise.all([
      prisma.buyingGuide.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: { id: true, title: true, slug: true, summary: true, imageUrl: true, category: true, createdAt: true }
      }),
      prisma.buyingGuide.count({ where })
    ]);
    return res.json({ success: true, data: guides, total });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Public: Single guide by slug ─────────────────────────────────────────────
export const getBuyingGuideBySlug = async (req: Request, res: Response) => {
  try {
    const guide = await prisma.buyingGuide.findUnique({ where: { slug: req.params.slug } });
    if (!guide || !guide.published) return res.status(404).json({ success: false, message: 'Guide not found' });
    return res.json({ success: true, data: guide });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: List all guides ────────────────────────────────────────────────────
export const getAllGuidesAdmin = async (req: Request, res: Response) => {
  try {
    const guides = await prisma.buyingGuide.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: guides });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Create guide ───────────────────────────────────────────────────────
export const createBuyingGuide = async (req: Request, res: Response) => {
  try {
    const { title, slug, summary, content, imageUrl, category, published } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ success: false, message: 'title, slug and content are required' });
    }
    const guide = await prisma.buyingGuide.create({
      data: { title, slug, summary: summary || '', content, imageUrl, category, published: published !== false }
    });
    return res.status(201).json({ success: true, data: guide });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Update guide ───────────────────────────────────────────────────────
export const updateBuyingGuide = async (req: Request, res: Response) => {
  try {
    const guide = await prisma.buyingGuide.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    return res.json({ success: true, data: guide });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Delete guide ───────────────────────────────────────────────────────
export const deleteBuyingGuide = async (req: Request, res: Response) => {
  try {
    await prisma.buyingGuide.delete({ where: { id: parseInt(req.params.id) } });
    return res.json({ success: true, message: 'Guide deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
