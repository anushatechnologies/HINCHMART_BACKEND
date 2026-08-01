import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStoreProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid vendor ID' });
      return;
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        ownerName: true,
        businessType: true,
        contactEmail: true,
        contactPhone: true,
        logoUrl: true,
        bannerUrl: true,
        aboutStore: true,
        businessHours: true,
        returnPolicy: true,
        shippingPolicy: true,
        warrantyPolicy: true,
        gstin: true,
        kycStatus: true,
        status: true,
        createdAt: true,
      }
    });

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found' });
      return;
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch store profile', error: error.message });
  }
};

export const updateStoreProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      companyName, ownerName, contactPhone,
      logoUrl, bannerUrl,
      aboutStore,
      businessHours,
      returnPolicy, shippingPolicy, warrantyPolicy
    } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(ownerName !== undefined && { ownerName }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(aboutStore !== undefined && { aboutStore }),
        ...(businessHours !== undefined && { businessHours }),
        ...(returnPolicy !== undefined && { returnPolicy }),
        ...(shippingPolicy !== undefined && { shippingPolicy }),
        ...(warrantyPolicy !== undefined && { warrantyPolicy }),
      },
      select: {
        id: true,
        companyName: true,
        ownerName: true,
        contactPhone: true,
        logoUrl: true,
        bannerUrl: true,
        aboutStore: true,
        businessHours: true,
        returnPolicy: true,
        shippingPolicy: true,
        warrantyPolicy: true,
        kycStatus: true,
        status: true,
      }
    });

    res.status(200).json({ success: true, message: 'Store updated successfully', data: vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update store', error: error.message });
  }
};
