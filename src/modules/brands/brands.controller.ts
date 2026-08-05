import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all active global brands (For Option A typeahead)
 * GET /api/brands
 */
export const getActiveBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        country: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ success: true, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
