import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// GET /api/search?q=drill&type=all
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, type = 'all', limit = '8' } = req.query;
    const query = (q as string)?.trim();
    if (!query || query.length < 2) {
      return res.json({ success: true, data: { products: [], brands: [], categories: [] } });
    }

    const take = parseInt(limit as string);

    const [products, brands, categories] = await Promise.all([
      // Product search (name, brand, SKU, barcode, model number)
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { brand: { contains: query } },
            { modelNumber: { contains: query } },
            { barcode: { contains: query } },
            { hsnCode: { contains: query } },
          ]
        },
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
        take,
        orderBy: { name: 'asc' }
      }),

      // Brand search
      prisma.product.findMany({
        where: { isActive: true, brand: { contains: query } },
        select: { brand: true },
        distinct: ['brand'],
        take: 5,
      }),

      // Category search
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: query },
          parentId: null, // top-level only
        },
        include: { children: { take: 5 } },
        take: 5,
      }),
    ]);

    // Deduplicate brands
    const uniqueBrands = [...new Set(brands.map((p) => p.brand).filter(Boolean))];

    res.json({
      success: true,
      data: { products, brands: uniqueBrands, categories }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/search/popular — returns popular search terms based on top products
export const getPopularSearches = async (req: Request, res: Response) => {
  try {
    // Get top categories and brands as popular search terms
    const topCategories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      take: 6,
      orderBy: { id: 'asc' }
    });

    const topBrands = await prisma.product.findMany({
      where: { isActive: true, brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      take: 6,
    });

    const popular = [
      ...topCategories.map((c) => ({ label: c.name, type: 'category', slug: c.slug })),
      ...topBrands.map((p) => ({ label: p.brand, type: 'brand' })),
    ];

    res.json({ success: true, data: popular });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/search/sku?sku=ABC123
export const searchBySku = async (req: Request, res: Response) => {
  try {
    const { sku } = req.query;
    if (!sku) return res.json({ success: true, data: null });

    const variant = await prisma.productVariant.findFirst({
      where: { sku: { contains: sku as string } },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 }, category: true }
        }
      }
    });

    res.json({ success: true, data: variant?.product || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
