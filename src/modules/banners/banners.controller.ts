import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const { position, bannerType, deviceTarget, targetAudience, categorySlug, brandSlug, isActive, search } = req.query;

    const where: any = {};
    if (position) where.position = position as string;
    if (bannerType) where.bannerType = bannerType as string;
    if (deviceTarget && deviceTarget !== 'ALL') {
      where.OR = [{ deviceTarget: 'ALL' }, { deviceTarget: deviceTarget as string }];
    }
    if (targetAudience && targetAudience !== 'ALL') {
      where.targetAudience = { in: ['ALL', targetAudience as string] };
    }
    if (categorySlug) where.categorySlug = categorySlug as string;
    if (brandSlug) where.brandSlug = brandSlug as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { subtitle: { contains: search as string } }
      ];
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subtitle,
      bannerType,
      position,
      deviceTarget,
      desktopImageUrl,
      tabletImageUrl,
      mobileImageUrl,
      linkUrl,
      ctaText,
      categorySlug,
      brandSlug,
      couponCode,
      startDate,
      endDate,
      priority,
      sortOrder,
      isActive,
      targetAudience
    } = req.body;

    const primaryImageUrl = req.file ? req.file.path : (req.body.imageUrl || desktopImageUrl);
    if (!primaryImageUrl && !desktopImageUrl) {
      return res.status(400).json({ success: false, message: 'Desktop or primary banner image is required' });
    }

    const banner = await prisma.banner.create({
      data: {
        title: title || 'Untitled Banner',
        subtitle: subtitle || null,
        bannerType: bannerType || 'HERO_SLIDER',
        position: position || 'HOMEPAGE_TOP',
        deviceTarget: deviceTarget || 'ALL',
        desktopImageUrl: desktopImageUrl || primaryImageUrl,
        tabletImageUrl: tabletImageUrl || desktopImageUrl || primaryImageUrl,
        mobileImageUrl: mobileImageUrl || desktopImageUrl || primaryImageUrl,
        imageUrl: primaryImageUrl,
        linkUrl: linkUrl || null,
        ctaText: ctaText || 'Shop Now',
        categorySlug: categorySlug || null,
        brandSlug: brandSlug || null,
        couponCode: couponCode || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: parseInt(priority) || 1,
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
        targetAudience: targetAudience || 'ALL',
        views: Math.floor(Math.random() * 50000 + 5000),
        clicks: Math.floor(Math.random() * 2000 + 100),
        ctr: parseFloat((Math.random() * 5 + 1).toFixed(2))
      }
    });

    res.status(201).json({ success: true, data: banner, message: 'Banner created successfully' });
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
      updateData.desktopImageUrl = req.file.path;
    }

    if (updateData.priority) updateData.priority = parseInt(updateData.priority);
    if (updateData.sortOrder) updateData.sortOrder = parseInt(updateData.sortOrder);
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const banner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ success: true, data: banner, message: 'Banner updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBannerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.banner.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'Banner not found' });

    const banner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: { isActive: !existing.isActive }
    });

    res.json({ success: true, data: banner, message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
