import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// GET /api/filters?category=construction
// Returns all available filter options dynamically based on current product data
export const getFilters = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where: any = { isActive: true };
    if (category) {
      where.category = { slug: category as string };
    }

    const [brands, priceRange, countries, stockStatuses, attributes] = await Promise.all([
      // Distinct brands
      prisma.product.findMany({
        where: { ...where, brand: { not: null } },
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' },
      }),

      // Price min/max
      prisma.product.aggregate({
        where,
        _min: { basePrice: true },
        _max: { basePrice: true },
      }),

      // Distinct countries of origin
      prisma.product.findMany({
        where: { ...where, countryOfOrigin: { not: null } },
        select: { countryOfOrigin: true },
        distinct: ['countryOfOrigin'],
      }),

      // Stock statuses in use
      prisma.product.findMany({
        where,
        select: { stockStatus: true },
        distinct: ['stockStatus'],
      }),

      // Category-specific attributes (for dynamic filters like size, voltage, etc.)
      category
        ? prisma.attribute.findMany({
            where: { category: { slug: category as string } },
            include: { values: true },
          })
        : Promise.resolve([]),
    ]);

    res.json({
      success: true,
      data: {
        brands: brands.map((b) => b.brand).filter(Boolean),
        priceRange: {
          min: Number(priceRange._min.basePrice) || 0,
          max: Number(priceRange._max.basePrice) || 100000,
        },
        countries: countries.map((c) => c.countryOfOrigin).filter(Boolean),
        stockStatuses: stockStatuses.map((s) => s.stockStatus),
        attributes,
        // Static filter groups that apply to all products
        ratings: [4, 3, 2, 1],
        discountBrackets: ['10', '20', '30', '50', '70'],
        deliveryOptions: ['Same Day', 'Next Day', 'Within 3 Days', 'Within 7 Days'],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
