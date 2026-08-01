import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Customer: Create a support ticket ────────────────────────────────────────
export const createTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || null;
    const { name, email, subject, category, priority, body } = req.body;
    if (!name || !email || !subject || !body) {
      return res.status(400).json({ success: false, message: 'name, email, subject and body are required' });
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        name,
        email,
        subject,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        messages: {
          create: { senderType: 'CUSTOMER', senderName: name, body }
        }
      },
      include: { messages: true }
    });
    return res.status(201).json({ success: true, data: ticket, message: `Ticket #${ticket.id} created. We'll respond within 24 hours.` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Customer: Get my tickets ─────────────────────────────────────────────────
export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' }
    });
    return res.json({ success: true, data: tickets });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Customer: Reply to ticket ────────────────────────────────────────────────
export const replyToTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { body } = req.body;
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: parseInt(req.params.id), userId }
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    const message = await prisma.supportMessage.create({
      data: { ticketId: ticket.id, senderType: 'CUSTOMER', senderName: ticket.name, body }
    });
    await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: 'OPEN' } });
    return res.status(201).json({ success: true, data: message });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get all tickets ───────────────────────────────────────────────────
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const { status, priority, page = '1' } = req.query as any;
    const skip = (parseInt(page) - 1) * 20;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: { messages: { orderBy: { createdAt: 'asc' } } },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: 20
      }),
      prisma.supportTicket.count({ where })
    ]);
    return res.json({ success: true, data: tickets, total });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Update ticket status ─────────────────────────────────────────────
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { status, priority } = req.body;
    const ticket = await prisma.supportTicket.update({
      where: { id: parseInt(req.params.id) },
      data: { status, priority }
    });
    return res.json({ success: true, data: ticket });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Reply to ticket ───────────────────────────────────────────────────
export const agentReplyToTicket = async (req: Request, res: Response) => {
  try {
    const { body, agentName } = req.body;
    const message = await prisma.supportMessage.create({
      data: {
        ticketId: parseInt(req.params.id),
        senderType: 'AGENT',
        senderName: agentName || 'HinchMart Support',
        body
      }
    });
    await prisma.supportTicket.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'IN_PROGRESS' }
    });
    return res.status(201).json({ success: true, data: message });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
