import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { NotificationService } from '../../utils/notifications';

export const getPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      include: {
        _count: {
          select: { orders: { where: { status: 'OUT_FOR_DELIVERY' } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: partners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPartner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, vehicleNumber } = req.body;
    
    if (!name || !phone) {
       res.status(400).json({ success: false, message: 'Name and phone are required' });
       return;
    }

    const partner = await prisma.deliveryPartner.create({
      data: { name, phone, vehicleNumber }
    });

    res.status(201).json({ success: true, data: partner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { deliveryPartnerId } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { 
        deliveryPartnerId: parseInt(deliveryPartnerId),
        status: 'OUT_FOR_DELIVERY'
      },
      include: { user: true }
    });

    await NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, 'OUT_FOR_DELIVERY');

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const delhiveryWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber, trackingStatus } = req.body;

    if (!orderNumber || !trackingStatus) {
      res.status(400).json({ success: false, message: 'orderNumber and trackingStatus are required.' });
      return;
    }

    const validStatuses = ['PLACED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(trackingStatus.toUpperCase())) {
       res.status(400).json({ success: false, message: 'Invalid tracking status.' });
       return;
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { user: true }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: trackingStatus.toUpperCase() }
    });

    // Send email notification to the customer automatically!
    await NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, trackingStatus.toUpperCase());

    res.status(200).json({ success: true, message: 'Tracking status updated and customer notified.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const uploadPOD = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No POD image uploaded' });
      return;
    }

    // First fetch the order to trigger the commission engine if we update status to DELIVERED
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        user: true,
        items: { include: { variant: { include: { product: { include: { vendor: true } } } } } }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Trigger Commission Engine (from Phase 19)
    for (const item of order.items) {
      const vendor = item.variant.product.vendor;
      if (vendor) {
        const existing = await prisma.vendorSettlement.findFirst({
          where: { orderId: order.id, vendorId: vendor.id }
        });

        if (!existing) {
          const grossAmount = Number(item.priceAtPurchase) * item.quantity;
          const commissionRate = Number(vendor.commissionRate);
          const commissionAmount = (grossAmount * commissionRate) / 100;
          const netAmount = grossAmount - commissionAmount;

          await prisma.vendorSettlement.create({
            data: {
              vendorId: vendor.id,
              orderId: order.id,
              grossAmount,
              commissionAmount,
              netAmount,
              status: 'PENDING'
            }
          });
        }
      }
    }

    // Update order with POD and DELIVERED status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        podImageUrl: file.path,
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    });

    await NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, 'DELIVERED');

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
