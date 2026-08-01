import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// GET /api/notifications — get my notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.customerNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await prisma.customerNotification.count({ where: { userId, isRead: false } });
    return res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/:id/read — mark single as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await prisma.customerNotification.updateMany({
      where: { id: parseInt(req.params.id), userId },
      data: { isRead: true },
    });
    return res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/mark-all-read — mark all as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await prisma.customerNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/notifications/settings — get preferences
export const getNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    let settings = await prisma.customerNotificationSetting.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.customerNotificationSetting.create({
        data: { userId },
      });
    }
    return res.json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/notifications/settings — update preferences
export const updateNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { emailAlerts, smsAlerts, pushAlerts, promoEmails } = req.body;
    const settings = await prisma.customerNotificationSetting.upsert({
      where: { userId },
      create: { userId, emailAlerts, smsAlerts, pushAlerts, promoEmails },
      update: { emailAlerts, smsAlerts, pushAlerts, promoEmails },
    });
    return res.json({ success: true, data: settings, message: 'Preferences saved!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
