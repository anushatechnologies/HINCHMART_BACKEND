import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// GET /api/services — list all service offerings
export const getServices = async (req: Request, res: Response) => {
  try {
    const { category, page = '1', limit = '20' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { isActive: true };

    const [services, total] = await Promise.all([
      prisma.serviceOffering.findMany({
        where,
        include: { vendor: { select: { companyName: true, id: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceOffering.count({ where }),
    ]);
    return res.json({ success: true, data: services, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/services/:id — get single service details
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await prisma.serviceOffering.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vendor: { select: { companyName: true, id: true } },
        bookings: { select: { id: true, status: true } }
      },
    });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json({ success: true, data: service });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/services/bookings — create a service booking
export const createServiceBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, scheduledDate, timeSlot, serviceAddress, customerName } = req.body;
    if (!serviceId || !scheduledDate || !serviceAddress) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const service = await prisma.serviceOffering.findUnique({ where: { id: parseInt(serviceId) } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const booking = await prisma.serviceBooking.create({
      data: {
        serviceId: parseInt(serviceId),
        customerName: customerName || (req as any).user?.name || 'Customer',
        vendorId: service.vendorId,
        scheduledDate: new Date(scheduledDate),
        timeSlot: timeSlot || '09:00 - 11:00',
        serviceAddress,
        status: 'CONFIRMED',
        totalAmount: service.price,
      },
      include: { serviceOffering: true },
    });
    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/services/my-bookings — customer: list my bookings
export const getMyServiceBookings = async (req: Request, res: Response) => {
  try {
    const customerName = (req as any).user?.name || '';
    const bookings = await prisma.serviceBooking.findMany({
      where: { customerName },
      include: { serviceOffering: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/services/vendor/bookings — vendor: list their service bookings
export const getVendorServiceBookings = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).vendor?.id;
    if (!vendorId) return res.status(403).json({ success: false, message: 'Forbidden' });
    const { status } = req.query as any;
    const where: any = { vendorId };
    if (status) where.status = status;
    const bookings = await prisma.serviceBooking.findMany({
      where,
      include: { serviceOffering: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/services/bookings/:id/status — vendor: update booking status
export const updateServiceBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await prisma.serviceBooking.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
