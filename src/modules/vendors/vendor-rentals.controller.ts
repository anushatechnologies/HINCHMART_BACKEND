import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Dashboard & Overview ────────────────────────────────────────────────────
export const getRentalsOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const activeBookings = await prisma.rentalBooking.count({
      where: { vendorId, status: 'ACTIVE' }
    });

    const upcomingBookings = await prisma.rentalBooking.count({
      where: { vendorId, status: 'PENDING' }
    });

    // Calculate total deposits held
    const heldDepositsResult = await prisma.rentalBooking.findMany({
      where: { vendorId, depositStatus: 'HELD' },
      include: { product: { include: { rentalDetails: true } } }
    });
    const totalDeposits = heldDepositsResult.reduce((sum, b) => sum + Number(b.product.rentalDetails?.securityDeposit || 0), 0);

    const openMaintenance = await prisma.maintenanceRecord.count({
      where: { vendorId, status: 'OPEN' }
    });

    res.status(200).json({
      success: true,
      data: {
        activeBookings,
        upcomingBookings,
        totalDeposits,
        openMaintenance
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Rental Inventory ────────────────────────────────────────────────────────
export const getRentalProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const products = await prisma.product.findMany({
      where: { vendorId, isRentable: true },
      include: { rentalDetails: true }
    });

    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const configureRentalProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, dailyRate, securityDeposit, minDays } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(productId, 10) },
      data: {
        isRentable: true,
        rentalDetails: {
          upsert: {
            create: { dailyRate, securityDeposit, minDays },
            update: { dailyRate, securityDeposit, minDays }
          }
        }
      },
      include: { rentalDetails: true }
    });

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const getRentalBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const bookings = await prisma.rentalBooking.findMany({
      where: { vendorId },
      include: { product: { select: { name: true } } },
      orderBy: { startDate: 'asc' }
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { status, depositStatus } = req.body;

    const booking = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: { 
        ...(status && { status }), 
        ...(depositStatus && { depositStatus }) 
      }
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Maintenance & Damages ───────────────────────────────────────────────────
export const getMaintenanceRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const records = await prisma.maintenanceRecord.findMany({
      where: { vendorId },
      include: { product: { select: { name: true } } },
      orderBy: { reportedAt: 'desc' }
    });

    res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMaintenanceRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, productId, type, description, cost } = req.body;

    const record = await prisma.maintenanceRecord.create({
      data: {
        vendorId: parseInt(vendorId, 10),
        productId: parseInt(productId, 10),
        type,
        description,
        cost: cost ? parseFloat(cost) : null
      }
    });

    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
