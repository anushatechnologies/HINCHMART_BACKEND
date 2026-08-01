import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const sapInventoryWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates } = req.body; // Array of { sku, quantity }

    if (!Array.isArray(updates)) {
      res.status(400).json({ success: false, message: 'Invalid payload. Expected updates array.' });
      return;
    }

    const results = [];
    for (const item of updates) {
      if (item.sku && typeof item.quantity === 'number') {
        const variant = await prisma.productVariant.findFirst({ where: { sku: item.sku } });
        if (variant) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { stockQty: item.quantity }
          });
          results.push({ sku: item.sku, status: 'updated', newStock: item.quantity });
        } else {
          results.push({ sku: item.sku, status: 'not_found' });
        }
      }
    }

    res.status(200).json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
