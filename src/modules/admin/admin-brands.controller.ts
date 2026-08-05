import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================= GLOBAL BRANDS =================

export const getGlobalBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGlobalBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, logoUrl, description, website, trademarkNumber, country, status, manufacturer } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Brand name is required' });
      return;
    }

    // Check if brand exists
    const existing = await prisma.brand.findUnique({ where: { name } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Brand with this name already exists' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

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
        createdBy: req.user?.id || 1,
        approvedBy: req.user?.id || 1
      }
    });

    res.status(201).json({ success: true, data: brand, message: 'Brand created and auto-approved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing global brand
 * PUT /api/admin/brands/:id
 */
export const updateGlobalBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid brand ID' });
      return;
    }

    const { name, logoUrl, description, website, trademarkNumber, country, status, manufacturer } = req.body;

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Brand not found' });
      return;
    }

    // If name is changing, check uniqueness
    if (name && name !== existing.name) {
      const nameConflict = await prisma.brand.findUnique({ where: { name } });
      if (nameConflict) {
        res.status(400).json({ success: false, message: 'Another brand with this name already exists' });
        return;
      }
    }

    const slug = name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : existing.slug;

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name, slug }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(trademarkNumber !== undefined && { trademarkNumber }),
        ...(country !== undefined && { country }),
        ...(status && { status }),
      }
    });

    res.status(200).json({ success: true, data: updated, message: 'Brand updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a global brand
 * DELETE /api/admin/brands/:id
 */
export const deleteGlobalBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid brand ID' });
      return;
    }

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Brand not found' });
      return;
    }

    await prisma.brand.delete({ where: { id } });

    res.status(200).json({ success: true, message: `Brand "${existing.name}" deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle brand active/inactive status
 * PATCH /api/admin/brands/:id/toggle-status
 */
export const toggleBrandStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Brand not found' });
      return;
    }

    const newStatus = existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await prisma.brand.update({
      where: { id },
      data: { status: newStatus }
    });

    res.status(200).json({ success: true, data: updated, message: `Brand ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload / change brand logo
 * POST /api/admin/brands/:id/logo
 * multipart/form-data  field: logo
 */
export const uploadBrandLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid brand ID' });
      return;
    }

    const file = req.file as any;
    if (!file) {
      res.status(400).json({ success: false, message: 'No logo file provided' });
      return;
    }

    // Cloudinary URL is available as file.path when using multer-storage-cloudinary
    const logoUrl = file.path || file.secure_url || file.url;

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Brand not found' });
      return;
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: { logoUrl }
    });

    res.status(200).json({ success: true, data: updated, logoUrl, message: 'Brand logo updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= VENDOR BRAND REQUESTS (Option B) =================

export const getVendorBrandRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.vendorBrandRequest.findMany({
      include: {
        vendor: { select: { id: true, companyName: true, contactEmail: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendorBrandRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminRemark } = req.body; // APPROVED, REJECTED

    if (status === 'REJECTED' && !adminRemark) {
      res.status(400).json({ success: false, message: 'Admin remark is required for rejection' });
      return;
    }

    const request = await prisma.vendorBrandRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }

    const updatedRequest = await prisma.vendorBrandRequest.update({
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
            approvedBy: req.user?.id || 1
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
          approvedBy: req.user?.id || 1
        }
      });
    }

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= VENDOR BRAND ACCESS (Option A & C) =================

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
        approvedBy: status === 'APPROVED' ? (req.user?.id || 1) : null
      }
    });

    res.status(200).json({ success: true, data: updatedAccess });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
