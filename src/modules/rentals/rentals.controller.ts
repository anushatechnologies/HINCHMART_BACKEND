import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// GET /api/rentals — list all rentable products
export const getRentableProducts = async (req: Request, res: Response) => {
  try {
    const { category, city, page = '1', limit = '20' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = { isRentable: true, isActive: true };
    if (category) where.category = { slug: category };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: true, category: true },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({ success: true, data: products, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/rentals/request — create a rental request
export const createRentalRequest = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      customerName,
      customerPhone,
      customerEmail,
      startDate,
      durationDays,
      city,
      notes,
    } = req.body;

    if (!productId || !customerName || !customerPhone || !startDate || !durationDays || !city) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Fetch product to calculate total
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product || !product.isRentable || !product.rentPricePerDay) {
      return res.status(404).json({ success: false, message: 'Product not available for rent' });
    }

    const totalAmount = Number(product.rentPricePerDay) * parseInt(durationDays);

    const rental = await prisma.rentalRequest.create({
      data: {
        productId: parseInt(productId),
        userId: (req as any).user?.id || null,
        customerName,
        customerPhone,
        customerEmail,
        startDate: new Date(startDate),
        durationDays: parseInt(durationDays),
        city,
        totalAmount,
        notes,
        status: 'PENDING',
      },
      include: { product: { include: { images: true } } },
    });

    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/rentals/requests — admin: list all rental requests
export const getAllRentalRequests = async (req: Request, res: Response) => {
  try {
    const { status, page = '1' } = req.query as any;
    const skip = (parseInt(page) - 1) * 20;
    const where: any = {};
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      prisma.rentalRequest.findMany({
        where,
        include: { product: { include: { images: true } } },
        skip,
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rentalRequest.count({ where }),
    ]);

    return res.json({ success: true, data: requests, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/rentals/requests/:id/status — admin: update rental status
export const updateRentalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.rentalRequest.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/rentals/my-requests — customer: list my rental requests
export const getMyRentalRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const requests = await prisma.rentalRequest.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
