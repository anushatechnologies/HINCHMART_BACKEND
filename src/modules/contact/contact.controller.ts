import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Public: Submit contact inquiry ───────────────────────────────────────────
export const submitInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const inquiry = await prisma.contactInquiry.create({
      data: { name, email, phone, subject, message }
    });
    return res.status(201).json({ success: true, message: 'Message sent successfully. We will get back to you shortly.', data: inquiry });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get all inquiries ─────────────────────────────────────────────────
export const getInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: inquiries });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Update inquiry status (NEW -> READ -> REPLIED) ────────────────────
export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const inquiry = await prisma.contactInquiry.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    return res.json({ success: true, data: inquiry });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
