import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);

    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const warehouses = await prisma.vendorWarehouse.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: warehouses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses', error: error.message });
  }
};

export const addWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, name, address, city, state, pincode, contactNum, managerName, pickupAvailable, isPrimary } = req.body;

    if (!vendorId || !name || !address || !city || !state || !pincode || !contactNum) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // If this is set as primary, unset others for this vendor
    if (isPrimary) {
      await prisma.vendorWarehouse.updateMany({
        where: { vendorId: parseInt(vendorId, 10) },
        data: { isPrimary: false }
      });
    }

    const warehouse = await prisma.vendorWarehouse.create({
      data: {
        vendorId: parseInt(vendorId, 10),
        name,
        address,
        city,
        state,
        pincode,
        contactNum,
        managerName: managerName || null,
        pickupAvailable: pickupAvailable !== undefined ? pickupAvailable : true,
        isPrimary: isPrimary || false
      }
    });

    res.status(201).json({ success: true, message: 'Warehouse added successfully', data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add warehouse', error: error.message });
  }
};
