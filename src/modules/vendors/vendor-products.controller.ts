import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getVendorProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user?.id || parseInt(req.query.vendorId as string, 10);
    const status = req.query.status as string;

    let whereClause: Prisma.ProductWhereInput = {};

    if (vendorId && !isNaN(vendorId)) {
      whereClause.vendorId = vendorId;
    }

    if (status === 'DELETED') {
      whereClause.deletedAt = { not: null };
    } else {
      whereClause.deletedAt = null;
      if (status === 'PENDING') {
        whereClause.approvalStatus = 'PENDING';
      } else if (status === 'ACTIVE') {
        whereClause.approvalStatus = 'APPROVED';
      }
    }

    let products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: true,
        images: { where: { isPrimary: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (products.length === 0 && status !== 'DELETED') {
      products = await prisma.product.findMany({
        where: { deletedAt: null, approvalStatus: 'APPROVED' },
        include: {
          category: true,
          variants: true,
          images: { where: { isPrimary: true } }
        },
        take: 1000,
        orderBy: { createdAt: 'desc' }
      });
    }

    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

export const getVendorProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: true,
        videos: true,
        documents: true
      }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: error.message });
  }
};

export const createVendorProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user?.id || req.body.vendorId;
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
        vendorId: vendorId ? parseInt(vendorId, 10) : 1,
        basePrice: parseFloat(basePrice),
        mrp: mrp ? parseFloat(mrp) : parseFloat(basePrice) * 1.2,
        gstPercent: 18.00,
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
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

export const updateVendorInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, variantId, quantity } = req.body;
    const qty = parseInt(quantity, 10) || 0;

    if (variantId) {
      await prisma.productVariant.update({
        where: { id: parseInt(variantId, 10) },
        data: { stockQty: qty }
      });
    }

    if (productId) {
      const stockStatus = qty === 0 ? 'OUT_OF_STOCK' : qty < 10 ? 'LOW_STOCK' : 'IN_STOCK';
      await prisma.product.update({
        where: { id: parseInt(productId, 10) },
        data: {
          stockStatus
        }
      });
    }

    res.status(200).json({ success: true, message: 'Stock inventory updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update inventory', error: error.message });
  }
};

