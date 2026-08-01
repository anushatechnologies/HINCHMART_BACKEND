import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const addresses = await prisma.address.findMany({
      where: { userId }
    });
    res.json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { label, line1, line2, city, state, pincode, isDefault } = req.body;
    
    // If setting as default, unset others first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label,
        line1,
        line2,
        city,
        state,
        pincode,
        isDefault: isDefault || false
      }
    });
    res.status(201).json({ success: true, data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.address.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
