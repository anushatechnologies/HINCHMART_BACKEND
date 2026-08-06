import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ================= GLOBAL BRANDS CATALOG =================

export const getGlobalBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true, vendorAccess: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGlobalBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, logoUrl, description, website, trademarkNumber, country, status } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Brand name is required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      res.status(409).json({ success: false, message: 'A brand with this name or slug already exists' });
      return;
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logoUrl: logoUrl || null,
        description: description || null,
        website: website || null,
        trademarkNumber: trademarkNumber || null,
        country: country || 'India',
        status: status || 'ACTIVE',
        createdBy: (req as any).user?.id || 1,
        approvedBy: (req as any).user?.id || 1
      }
    });

    res.status(201).json({ success: true, data: brand, message: 'Brand created and auto-approved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGlobalBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, logoUrl, description, website, trademarkNumber, country, status } = req.body;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(trademarkNumber !== undefined && { trademarkNumber }),
        ...(country !== undefined && { country }),
        ...(status && { status })
      }
    });

    res.status(200).json({ success: true, data: brand, message: 'Brand updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGlobalBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete brand. It is linked to ${productCount} active products. Change status to INACTIVE instead.`
      });
      return;
    }

    await prisma.brand.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBrandStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'PENDING'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ success: true, data: brand, message: `Brand status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= BRAND REGISTRATION REQUESTS =================

export const getBrandRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await (prisma as any).brandRequest.findMany({
      include: {
        vendor: { select: { id: true, companyName: true, contactEmail: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBrandRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminRemark } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    if (status === 'REJECTED' && !adminRemark) {
      res.status(400).json({ success: false, message: 'Admin remark is required for rejection' });
      return;
    }

    const request = await (prisma as any).brandRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, message: 'Brand request not found' });
      return;
    }

    const updatedRequest = await (prisma as any).brandRequest.update({
      where: { id },
      data: { status, adminRemark }
    });

    if (status === 'APPROVED') {
      const slug = request.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      let brand = await prisma.brand.findUnique({ where: { name: request.brandName } });

      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: request.brandName,
            slug,
            logoUrl: request.brandLogoUrl,
            description: request.description,
            website: request.website,
            trademarkNumber: request.trademarkNumber,
            status: 'ACTIVE',
            approvedBy: (req as any).user?.id || 1
          }
        });
      }

      await prisma.vendorBrandAccess.upsert({
        where: { vendorId_brandId: { vendorId: request.vendorId, brandId: brand.id } },
        update: {
          accessType: 'OWNER',
          status: 'APPROVED',
          adminRemark: 'Automatically granted as brand owner upon approval of registration request.'
        },
        create: {
          vendorId: request.vendorId,
          brandId: brand.id,
          accessType: 'OWNER',
          status: 'APPROVED',
          adminRemark: 'Automatically granted as brand owner upon approval of registration request.',
          approvedBy: (req as any).user?.id || 1
        }
      });
    }

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= VENDOR BRAND ACCESS =================

export const getVendorBrandAccessRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessList = await prisma.vendorBrandAccess.findMany({
      include: {
        vendor: { select: { id: true, companyName: true, contactEmail: true } },
        brand: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: accessList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendorBrandAccessStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminRemark } = req.body;

    if (status === 'REJECTED' && !adminRemark) {
      res.status(400).json({ success: false, message: 'Admin remark is required for rejection' });
      return;
    }

    const updatedAccess = await prisma.vendorBrandAccess.update({
      where: { id },
      data: {
        status,
        adminRemark,
        approvedBy: status === 'APPROVED' ? ((req as any).user?.id || 1) : null
      }
    });

    res.status(200).json({ success: true, data: updatedAccess });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
