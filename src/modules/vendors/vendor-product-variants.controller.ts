import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProductVariants = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      include: { images: true }
    });
    res.status(200).json({ success: true, data: variants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { sku, price, stockQty, weight, attributesJson } = req.body;

    if (!sku || !price) {
      res.status(400).json({ success: false, message: 'SKU and price are required' });
      return;
    }

    // Check SKU uniqueness
    const existing = await prisma.productVariant.findUnique({ where: { sku } });
    if (existing) {
      res.status(409).json({ success: false, message: 'SKU already exists' });
      return;
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku,
        price,
        stockQty: stockQty || 0,
        weight: weight || null,
        attributesJson: attributesJson || null
      }
    });
    res.status(201).json({ success: true, data: variant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = parseInt(req.params.variantId, 10);
    const { sku, price, stockQty, weight, attributesJson } = req.body;

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(sku && { sku }),
        ...(price && { price }),
        ...(stockQty !== undefined && { stockQty: parseInt(stockQty, 10) }),
        ...(weight !== undefined && { weight }),
        ...(attributesJson !== undefined && { attributesJson })
      }
    });
    res.status(200).json({ success: true, data: variant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const variantId = parseInt(req.params.variantId, 10);
    
    // Ensure product still has at least 1 variant
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      res.status(404).json({ success: false, message: 'Variant not found' });
      return;
    }

    const variantCount = await prisma.productVariant.count({ where: { productId: variant.productId } });
    if (variantCount <= 1) {
      res.status(400).json({ success: false, message: 'Cannot delete the last variant of a product' });
      return;
    }

    await prisma.productVariant.delete({ where: { id: variantId } });
    res.status(200).json({ success: true, message: 'Variant deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
