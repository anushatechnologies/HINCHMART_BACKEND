import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Public: Get all active FAQs ───────────────────────────────────────────────
export const getFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }]
    });
    
    // Group by category
    const grouped = faqs.reduce((acc: any, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push(faq);
      return acc;
    }, {});

    return res.json({ success: true, data: grouped });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get all FAQs (including inactive) ──────────────────────────────────
export const getAllFaqsAdmin = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }]
    });
    return res.json({ success: true, data: faqs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Create FAQ ────────────────────────────────────────────────────────
export const createFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer, category, order, isActive } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }
    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        category: category || 'GENERAL',
        order: order ? parseInt(order) : 0,
        isActive: isActive !== false
      }
    });
    return res.status(201).json({ success: true, data: faq });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Update FAQ ────────────────────────────────────────────────────────
export const updateFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer, category, order, isActive } = req.body;
    const faq = await prisma.faq.update({
      where: { id: parseInt(req.params.id) },
      data: {
        question,
        answer,
        category,
        order: order ? parseInt(order) : undefined,
        isActive
      }
    });
    return res.json({ success: true, data: faq });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Delete FAQ ────────────────────────────────────────────────────────
export const deleteFaq = async (req: Request, res: Response) => {
  try {
    await prisma.faq.delete({ where: { id: parseInt(req.params.id) } });
    return res.json({ success: true, message: 'FAQ deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
