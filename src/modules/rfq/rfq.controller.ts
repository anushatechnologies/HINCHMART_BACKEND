import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const createRfq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, notes, boqUrl } = req.body;
    // Assume user is authenticated and we have req.user.id
    // For MVP, we'll hardcode or take from body if no auth middleware
    const userId = req.body.userId || 1; // Fallback to 1 for testing

    const rfqNumber = `RFQ-${Date.now().toString().slice(-6)}`;

    const rfq = await prisma.rfq.create({
      data: {
        userId,
        rfqNumber,
        notes,
        boqUrl,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            productName: item.productName || 'Unknown Product',
            quantity: parseInt(item.quantity, 10) || 1,
            targetPrice: item.targetPrice ? parseFloat(item.targetPrice) : null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({ success: true, message: 'RFQ submitted successfully', data: rfq });
  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({ success: false, message: 'Failed to create RFQ', error: error.message });
  }
};

export const getRfqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const rfqs = await prisma.rfq.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } }
          }
        },
        quotes: {
          include: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: rfqs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch RFQs', error: error.message });
  }
};

export const getMyRfqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || 1; // Assuming auth middleware sets req.user
    
    const rfqs = await prisma.rfq.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } }
          }
        },
        quotes: {
          include: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: rfqs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch your RFQs', error: error.message });
  }
};

export const createQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const rfqId = parseInt(req.params.id, 10);
    const { items, notes, validUntil } = req.body;
    // items should be [{ rfqItemId, unitPrice, remarks }]

    if (!rfqId) {
       res.status(400).json({ success: false, message: 'Invalid RFQ ID' });
       return;
    }

    let totalAmount = 0;
    const quoteItemsData = items.map((item: any) => {
       const qty = item.quantity || 1; 
       const total = parseFloat(item.unitPrice) * qty;
       totalAmount += total;
       return {
         rfqItemId: parseInt(item.rfqItemId, 10),
         unitPrice: parseFloat(item.unitPrice),
         totalPrice: total,
         remarks: item.remarks
       };
    });

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        totalAmount,
        notes,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        items: {
          create: quoteItemsData
        }
      },
      include: {
        items: true
      }
    });

    // Update RFQ status
    await prisma.rfq.update({
      where: { id: rfqId },
      data: { status: 'QUOTED' }
    });

    res.status(201).json({ success: true, message: 'Quote generated successfully', data: quote });
  } catch (error: any) {
    console.error('Error creating Quote:', error);
    res.status(500).json({ success: false, message: 'Failed to create quote', error: error.message });
  }
};

export const getRfqDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const rfqId = parseInt(req.params.id, 10);
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
        quotes: { include: { items: true } }
      }
    });
    if (!rfq) {
      res.status(404).json({ success: false, message: 'RFQ not found' });
      return;
    }
    res.json({ success: true, data: rfq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch RFQ', error: error.message });
  }
};

export const getRfqMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const rfqId = parseInt(req.params.id, 10);
    const messages = await prisma.rfqMessage.findMany({
      where: { rfqId },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};
