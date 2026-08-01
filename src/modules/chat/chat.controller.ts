import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Customer: Start Chat Session ─────────────────────────────────────────────
export const startSession = async (req: Request, res: Response) => {
  try {
    const { name, email, visitorId } = req.body;
    const userId = (req as any).user?.id || null;
    
    // Check for existing active session for this visitor or user
    let session;
    if (userId) {
      session = await prisma.chatSession.findFirst({ where: { userId, status: { in: ['WAITING', 'ACTIVE'] } } });
    } else if (visitorId) {
      session = await prisma.chatSession.findFirst({ where: { visitorId, status: { in: ['WAITING', 'ACTIVE'] } } });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          name,
          email,
          userId,
          visitorId: visitorId || null,
          status: 'WAITING',
          messages: JSON.stringify([
            { role: 'SYSTEM', content: 'Connecting you to the next available agent...', ts: new Date() }
          ])
        }
      });
    }
    return res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Customer: Get Chat Session ───────────────────────────────────────────────
export const getSession = async (req: Request, res: Response) => {
  try {
    const session = await prisma.chatSession.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    // Parse messages
    const messages = typeof session.messages === 'string' ? JSON.parse(session.messages) : session.messages;
    return res.json({ success: true, data: { ...session, messages } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Customer/Admin: Send Message ─────────────────────────────────────────────
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { role, content } = req.body;
    const session = await prisma.chatSession.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status === 'CLOSED') return res.status(400).json({ success: false, message: 'Session is closed' });

    let messages = typeof session.messages === 'string' ? JSON.parse(session.messages) : session.messages;
    if (!Array.isArray(messages)) messages = [];
    
    messages.push({ role, content, ts: new Date() });

    const updated = await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        messages: JSON.stringify(messages),
        status: role === 'AGENT' ? 'ACTIVE' : session.status
      }
    });

    return res.json({ success: true, data: { ...updated, messages } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get all sessions ──────────────────────────────────────────────────
export const getAllSessionsAdmin = async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const parsedSessions = sessions.map(s => ({
      ...s,
      messages: typeof s.messages === 'string' ? JSON.parse(s.messages) : s.messages
    }));

    return res.json({ success: true, data: parsedSessions });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Close Session ─────────────────────────────────────────────────────
export const closeSession = async (req: Request, res: Response) => {
  try {
    const session = await prisma.chatSession.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'CLOSED' }
    });
    return res.json({ success: true, data: session });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
