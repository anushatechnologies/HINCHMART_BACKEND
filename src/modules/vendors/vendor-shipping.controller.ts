import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Couriers ────────────────────────────────────────────────────────────────
export const getCouriers = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const couriers = await prisma.vendorCourier.findMany({
      where: { vendorId }
    });

    res.status(200).json({ success: true, data: couriers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCourier = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { courierName, accountCode, isDefault } = req.body;

    if (isNaN(vendorId) || !courierName) {
      res.status(400).json({ success: false, message: 'vendorId and courierName are required' });
      return;
    }

    if (isDefault) {
      await prisma.vendorCourier.updateMany({
        where: { vendorId },
        data: { isDefault: false }
      });
    }

    const courier = await prisma.vendorCourier.create({
      data: {
        vendorId,
        courierName,
        accountCode,
        isDefault: isDefault || false
      }
    });

    res.status(201).json({ success: true, data: courier });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Pickup Requests ─────────────────────────────────────────────────────────
export const getPickupRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const pickups = await prisma.pickupRequest.findMany({
      where: { vendorId },
      orderBy: { scheduledDate: 'desc' }
    });

    res.status(200).json({ success: true, data: pickups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const schedulePickup = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { courierName, scheduledDate, orderItemIds } = req.body;

    if (isNaN(vendorId) || !courierName || !scheduledDate || !orderItemIds || !Array.isArray(orderItemIds)) {
      res.status(400).json({ success: false, message: 'Missing required pickup details' });
      return;
    }

    const pickup = await prisma.pickupRequest.create({
      data: {
        vendorId,
        courierName,
        scheduledDate: new Date(scheduledDate),
        orderItemIds
      }
    });

    res.status(201).json({ success: true, data: pickup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tracking & Labels ───────────────────────────────────────────────────────
export const getShippingOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    // Get Active Shipments (Status SHIPPED)
    const activeShipments = await prisma.orderItem.findMany({
      where: { vendorId, status: 'SHIPPED' },
      include: {
        order: { select: { orderNumber: true, user: { select: { name: true, email: true } } } },
        variant: { include: { product: { select: { name: true } } } }
      }
    });

    // Get Delivered Shipments
    const deliveredShipments = await prisma.orderItem.findMany({
      where: { vendorId, status: 'DELIVERED' },
      include: {
        order: { select: { orderNumber: true, user: { select: { name: true } } } },
        variant: { include: { product: { select: { name: true } } } }
      }
    });

    // Get Ready to Ship for Labels
    const readyToShip = await prisma.orderItem.findMany({
      where: { vendorId, status: { in: ['PACKED', 'READY_TO_SHIP'] } },
      include: {
        order: { select: { orderNumber: true, companyName: true, user: { select: { name: true } } } },
        variant: { include: { product: { select: { name: true, slug: true } } } }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        activeShipments,
        deliveredShipments,
        readyToShip
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
