import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getVendorOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: In a real implementation, you'd get the vendorId from req.user (JWT)
    // For MVP, we pass it via query param or header. Let's assume query for now, or token.
    // If we use JWT, we need authMiddleware. Let's mock with query `vendorId`.
    const vendorId = parseInt(req.query.vendorId as string, 10);

    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        vendorId: vendorId
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            status: true,
            total: true,
            companyName: true,
            user: {
              select: {
                name: true,
                email: true,
                companyName: true
              }
            }
          }
        },
        variant: {
          include: {
            product: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });

    res.status(200).json({
      success: true,
      data: orderItems
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendor orders', error: error.message });
  }
};

export const updateOrderItemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const { status, trackingNumber, courierName } = req.body;

    if (isNaN(itemId)) {
      res.status(400).json({ success: false, message: 'Invalid item ID' });
      return;
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(courierName && { courierName })
      }
    });

    res.status(200).json({
      success: true,
      message: 'Order item updated successfully',
      data: updatedItem
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update order item', error: error.message });
  }
};
