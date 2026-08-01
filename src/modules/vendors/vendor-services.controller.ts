import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Dashboard Overview ──────────────────────────────────────────────────────
export const getServicesOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const activeServices = await prisma.serviceOffering.count({ where: { vendorId, isActive: true } });
    const upcomingBookings = await prisma.serviceBooking.count({ where: { vendorId, status: 'CONFIRMED' } });
    const completedBookings = await prisma.serviceBooking.count({ where: { vendorId, status: 'COMPLETED' } });
    const activeAreas = await prisma.serviceArea.count({ where: { vendorId, isActive: true } });

    res.status(200).json({
      success: true,
      data: { activeServices, upcomingBookings, completedBookings, activeAreas }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Service Offerings ───────────────────────────────────────────────────────
export const getServiceOfferings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const services = await prisma.serviceOffering.findMany({ where: { vendorId } });
    res.status(200).json({ success: true, data: services });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceOffering = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { name, description, price, durationMin } = req.body;

    const service = await prisma.serviceOffering.create({
      data: { vendorId, name, description, price: parseFloat(price), durationMin: parseInt(durationMin, 10) }
    });

    res.status(201).json({ success: true, data: service });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Time Slots ──────────────────────────────────────────────────────────────
export const getTimeSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const slots = await prisma.serviceTimeSlot.findMany({ where: { vendorId }, orderBy: { dayOfWeek: 'asc' } });
    res.status(200).json({ success: true, data: slots });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTimeSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { dayOfWeek, startTime, endTime } = req.body;

    const slot = await prisma.serviceTimeSlot.create({
      data: { vendorId, dayOfWeek: parseInt(dayOfWeek, 10), startTime, endTime }
    });

    res.status(201).json({ success: true, data: slot });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Service Areas ───────────────────────────────────────────────────────────
export const getServiceAreas = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const areas = await prisma.serviceArea.findMany({ where: { vendorId } });
    res.status(200).json({ success: true, data: areas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceArea = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    const { pincode, city } = req.body;

    const area = await prisma.serviceArea.create({
      data: { vendorId, pincode, city }
    });

    res.status(201).json({ success: true, data: area });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const getServiceBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const bookings = await prisma.serviceBooking.findMany({
      where: { vendorId },
      include: { serviceOffering: { select: { name: true, price: true } } },
      orderBy: { scheduledDate: 'asc' }
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateServiceBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const booking = await prisma.serviceBooking.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
