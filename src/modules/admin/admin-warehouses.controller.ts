import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllWarehousesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const warehouses = await prisma.vendorWarehouse.findMany({
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
            contactPhone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: warehouses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
