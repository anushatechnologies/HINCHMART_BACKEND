import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Categories ───────────────────────────────────────────────────────────────

export const getVendorCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestCategoryApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon, description } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        isActive: false // Pending approval
      }
    });

    res.status(201).json({ success: true, data: category, message: 'Category request submitted for approval' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Brands ───────────────────────────────────────────────────────────────────

export const getVendorBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ success: true, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestBrandApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, logoUrl } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Brand name is required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logoUrl: logoUrl || null,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, data: brand, message: 'Brand request submitted for approval' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
