import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: { include: { images: true } }
      }
    });
    res.json({ success: true, data: wishlist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;

    const exists = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId: parseInt(productId) } }
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }

    const item = await prisma.wishlistItem.create({
      data: { userId, productId: parseInt(productId) }
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.params;

    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId: parseInt(productId) } }
    });

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body; // Array of product IDs

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid items array' });
    }

    for (const productId of items) {
      if (!productId) continue;
      
      const exists = await prisma.wishlistItem.findUnique({
        where: { userId_productId: { userId, productId: parseInt(productId) } }
      });

      if (!exists) {
        await prisma.wishlistItem.create({
          data: { userId, productId: parseInt(productId) }
        });
      }
    }

    res.json({ success: true, message: 'Wishlist synced successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
