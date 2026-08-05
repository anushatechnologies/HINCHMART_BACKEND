import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getVendorProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user?.id || parseInt(req.query.vendorId as string, 10);
    const status = req.query.status as string; // 'ACTIVE', 'PENDING', 'DELETED'

    if (!vendorId || isNaN(vendorId)) {
      res.status(401).json({ success: false, message: 'vendorId is required' });
      return;
    }

    let whereClause: Prisma.ProductWhereInput = { vendorId };

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

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: true,
        images: { where: { isPrimary: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

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
    const {
      vendorId, name, categoryId, description, basePrice, mrp,
      moq, gstPercent, stockStatus, stockQty, barcode, modelNumber, hsnCode,
      countryOfOrigin, warranty, brand
    } = req.body;

    const extractedVendorId = vendorId || (req as any).user?.id;
    if (!extractedVendorId || !name || !categoryId || !basePrice || !mrp) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name, slug, description, basePrice, mrp, brand,
        categoryId: parseInt(categoryId, 10),
      vendorId: vendorId || (req as any).user?.id,
        moq: moq ? parseInt(moq, 10) : 1,
        gstPercent: gstPercent || 0,
        stockStatus: stockStatus || 'IN_STOCK',
        barcode, modelNumber, hsnCode, countryOfOrigin, warranty,
        approvalStatus: 'PENDING', // All new products go to pending
        variants: {
          create: {
            sku: 'SKU-' + Date.now(),
            price: basePrice,
            stockQty: stockQty ? parseInt(stockQty, 10) : 0
          }
        }
      },
      include: { variants: true }
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

export const updateVendorProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body; // Expects partial Product object

    // Prevent vendor from changing approval status or ownership directly
    delete updates.approvalStatus;
    delete updates.vendorId;
    delete updates.id;
    
    // Safely parse JSON fields if provided as objects
    if (updates.technicalSpecs && typeof updates.technicalSpecs === 'object') {
      // Prisma handles JSON objects directly, no stringify needed if it's already an object
    }

    const product = await prisma.product.update({
      where: { id },
      data: updates
    });

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

export const createProductDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, categoryId, productType } = req.body;
    if (!vendorId || !categoryId) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const name = "Draft Product " + Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId: parseInt(categoryId, 10),
        vendorId: parseInt(vendorId, 10),
        productType: productType || 'PHYSICAL',
        approvalStatus: 'DRAFT',
        basePrice: 0,
        mrp: 0,
        gstPercent: 0,
      }
    });

    res.status(201).json({ success: true, message: 'Draft created', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create draft', error: error.message });
  }
};

export const submitProductForApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    // In a real app, perform validation here to check if all required fields are filled

    const product = await prisma.product.update({
      where: { id },
      data: { approvalStatus: 'SUBMITTED' }
    });

    res.status(200).json({ success: true, message: 'Product submitted for approval', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit product', error: error.message });
  }
};

export const updateRentalDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;
    
    // Check if rental details exist
    const existing = await prisma.rentalDetails.findUnique({ where: { productId: id } });
    
    let rentalDetails;
    if (existing) {
      rentalDetails = await prisma.rentalDetails.update({
        where: { productId: id },
        data: updates
      });
    } else {
      rentalDetails = await prisma.rentalDetails.create({
        data: { ...updates, productId: id }
      });
    }

    res.status(200).json({ success: true, message: 'Rental details updated', data: rentalDetails });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update rental details', error: error.message });
  }
};

export const deleteVendorProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({ success: true, message: 'Product moved to trash' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};

export const restoreVendorProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    
    await prisma.product.update({
      where: { id },
      data: { deletedAt: null }
    });

    res.status(200).json({ success: true, message: 'Product restored successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to restore product', error: error.message });
  }
};


export const updateVendorProductInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { stockStatus, variantId, stockQty } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { ...(stockStatus && { stockStatus }) }
    });

    let variant = null;
    if (variantId && stockQty !== undefined) {
      variant = await prisma.productVariant.update({
        where: { id: parseInt(variantId, 10) },
        data: { stockQty: parseInt(stockQty, 10) }
      });
    }

    res.status(200).json({ success: true, message: 'Inventory updated successfully', data: { product, variant } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update inventory', error: error.message });
  }
};
