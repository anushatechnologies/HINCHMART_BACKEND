import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, linkUrl, position, sortOrder, isActive } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl,
        position: position || 'HERO',
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
        views: Math.floor(Math.random() * 50000 + 5000), // Initialize with mock metrics for demo if new
        clicks: Math.floor(Math.random() * 2000 + 100),
        ctr: (Math.random() * 5 + 1)
      }
    });
    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };
    
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }
    
    if (updateData.sortOrder) updateData.sortOrder = parseInt(updateData.sortOrder);
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;

    const banner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
