import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, brand, search, minPrice, maxPrice, stockStatus, page = '1', limit = '100' } = req.query;
    const user = (req as any).user;

    const where: any = { 
      deletedAt: null
    };

    // Only filter by isActive & APPROVED for regular unauthenticated public users
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'VENDOR')) {
      where.isActive = true;
      where.approvalStatus = { in: ['APPROVED', 'LIVE'] };
    }

    // Vendor Data Isolation
    if (user?.role === 'VENDOR') {
      where.vendorId = user.id;
    }

    if (category) where.category = { slug: category as string };
    if (brand) where.brand = { contains: brand as string };
    if (search) where.name = { contains: search as string };
    if (stockStatus) where.stockStatus = stockStatus as string;
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const total = await prisma.product.count({ where });

    let products = await prisma.product.findMany({
      where,
      include: { 
        category: true,
        images: { where: { isPrimary: true } },
        rentalDetails: true
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    // Contract Pricing for B2B Corporate Companies
    if (user?.companyId) {
      const contracts = await prisma.companyContract.findMany({
        where: { companyId: user.companyId, isActive: true }
      });
      if (contracts.length > 0) {
        products = products.map((prod: any) => {
          const contract = contracts.find(c => c.productId === prod.id);
          if (contract) {
            prod.basePrice = contract.customPrice;
            prod.isContractPrice = true;
          }
          return prod;
        });
      }
    }

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const user = (req as any).user;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        vendor: {
          select: { id: true, companyName: true, logoUrl: true }
        },
        rentalDetails: true,
        reviews: {
          include: {
            user: { select: { name: true } }
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product || product.deletedAt) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (user?.companyId) {
      const contract = await prisma.companyContract.findFirst({
        where: { companyId: user.companyId, productId: product.id, isActive: true }
      });
      if (contract) {
        (product as any).basePrice = contract.customPrice;
        (product as any).isContractPrice = true;
      }
    }

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, brand, categoryId, basePrice, mrp, sku, description, isRentable, rentPricePerDay, isSameDayDelivery } = req.body;

    if (!name || !categoryId || !basePrice) {
      res.status(400).json({ success: false, message: 'Name, Category, and Price are required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        brand: brand || 'Generic',
        categoryId: parseInt(categoryId, 10),
        vendorId: (req as any).user?.id || 1,
        basePrice: parseFloat(basePrice),
        mrp: mrp ? parseFloat(mrp) : parseFloat(basePrice) * 1.2,
        modelNumber: sku || `SKU-${Date.now()}`,
        description: description || '',
        approvalStatus: 'APPROVED',
        isActive: true,
        isRentable: Boolean(isRentable),
        rentPricePerDay: rentPricePerDay ? parseFloat(rentPricePerDay) : null,
        isSameDayDelivery: Boolean(isSameDayDelivery)
      }
    });

    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });

    res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
