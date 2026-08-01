import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Returns & Refunds ───────────────────────────────────────────────────────
export const getReturnRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const returns = await prisma.returnRequest.findMany({
      where: { vendorId },
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: returns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReturnStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body; // APPROVED, REJECTED, REFUNDED

    const returnReq = await prisma.returnRequest.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: returnReq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Support Tickets ─────────────────────────────────────────────────────────
export const getSupportTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const tickets = await prisma.vendorSupportTicket.findMany({
      where: { vendorId },
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body; // IN_PROGRESS, RESOLVED, CLOSED

    const ticket = await prisma.vendorSupportTicket.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Live Chat & Messages ────────────────────────────────────────────────────
export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const messages = await prisma.vendorChatMessage.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { content } = req.body;

    const message = await prisma.vendorChatMessage.create({
      data: {
        vendorId,
        senderId: `VEND_${vendorId}`,
        senderType: 'VENDOR',
        content
      }
    });

    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
