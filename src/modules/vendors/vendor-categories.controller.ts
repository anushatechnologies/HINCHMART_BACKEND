import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Categories & Requests ────────────────────────────────────────────────────

export const getVendorCategoryRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.params.id, 10);
    const requests = await prisma.vendorCategoryRequest.findMany({
      where: { vendorId },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestCategoryApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.params.id, 10);
    const { categoryId, comments } = req.body;

    if (!categoryId) {
      res.status(400).json({ success: false, message: 'categoryId is required' });
      return;
    }

    const existing = await prisma.vendorCategoryRequest.findUnique({
      where: { vendorId_categoryId: { vendorId, categoryId: parseInt(categoryId, 10) } }
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'Request already exists for this category' });
      return;
    }

    const request = await prisma.vendorCategoryRequest.create({
      data: {
        vendorId,
        categoryId: parseInt(categoryId, 10),
        comments,
        status: 'PENDING'
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Attributes ───────────────────────────────────────────────────────────────

export const getVendorCategoryAttributes = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.params.id, 10);

    // Get categories the vendor is approved for
    const approvedRequests = await prisma.vendorCategoryRequest.findMany({
      where: { vendorId, status: 'APPROVED' },
      select: { categoryId: true }
    });

    const categoryIds = approvedRequests.map(r => r.categoryId);

    // Get attributes for these categories
    const attributes = await prisma.attribute.findMany({
      where: { categoryId: { in: categoryIds } },
      include: { 
        category: { select: { name: true } },
        values: true 
      }
    });

    res.status(200).json({ success: true, data: attributes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Brands ───────────────────────────────────────────────────────────────────

export const getVendorBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.params.id, 10);
    const brands = await prisma.vendorBrand.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestBrandApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.params.id, 10);
    const { name, logoUrl } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Brand name is required' });
      return;
    }

    const existing = await prisma.vendorBrand.findUnique({
      where: { vendorId_name: { vendorId, name } }
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'Brand already exists in your portfolio' });
      return;
    }

    const brand = await prisma.vendorBrand.create({
      data: {
        vendorId,
        name,
        logoUrl,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, data: brand });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
