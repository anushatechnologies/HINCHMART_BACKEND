import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    let settings = await prisma.vendorNotificationSetting.findUnique({
      where: { vendorId }
    });

    if (!settings) {
      settings = await prisma.vendorNotificationSetting.create({
        data: {
          vendorId,
          emailEvents: { newOrder: true, lowStock: true, customerMessage: true, returnRequest: true },
          smsEvents: { newOrder: false, urgentTicket: true },
          pushEvents: { newOrder: true, customerMessage: true },
          whatsappEvents: { newOrder: false, shippingUpdate: true }
        }
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    // Prepare data by omitting vendorId and id from the body
    const { id, vendorId: vId, ...updateData } = req.body;

    const settings = await prisma.vendorNotificationSetting.update({
      where: { vendorId },
      data: updateData
    });

    res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
