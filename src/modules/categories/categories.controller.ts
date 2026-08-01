import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    // Only fetch root categories, include their children
    const categories = await prisma.category.findMany({
      where: { 
        isActive: true,
        parentId: null
      },
      include: { children: true },
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, parentId } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId ? parseInt(parentId) : null,
        imageUrl,
      },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug, isActive } = req.body;
    let updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (isActive !== undefined) updateData.isActive = typeof isActive === 'string' ? isActive === 'true' : isActive;
    
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.category.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
