import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { NotificationService } from '../../utils/notifications';

export const getMyPOs = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user.companyId) {
       res.status(403).json({ success: false, message: 'Not linked to a B2B company' });
       return;
    }

    const pos = await prisma.purchaseOrder.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.status(200).json({ success: true, data: pos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadPO = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user.companyId) {
      res.status(403).json({ success: false, message: 'Not linked to a B2B company' });
      return;
    }

    const { poNumber, amount } = req.body;
    const file = req.file;

    if (!file || !poNumber || !amount) {
      res.status(400).json({ success: false, message: 'PO Number, Amount and Document are required' });
      return;
    }

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        amount: parseFloat(amount),
        documentUrl: file.path,
        companyId: user.companyId,
        userId: user.id
      }
    });

    res.status(201).json({ success: true, data: po });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPOs = async (req: Request, res: Response): Promise<void> => {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
        user: { select: { name: true, email: true } },
        orders: true
      }
    });
    res.status(200).json({ success: true, data: pos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePOStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: { user: true, company: true }
    });

    // Generate actual Order if approved
    if (status === 'APPROVED') {
      // Create a dummy order linked to this PO
      // In a real system, the PO would also detail the items. 
      // For MVP, we will create an empty/dummy order or assume they have a cart.
      // Let's create an order for the PO amount.
      
      // Fetch some generic address from user or company for shipping
      const address = await prisma.address.findFirst({ where: { userId: po.userId } });

      if (address) {
        const order = await prisma.order.create({
          data: {
            userId: po.userId,
            companyId: po.companyId,
            addressId: address.id,
            total: po.amount,
            subtotal: po.amount,
            tax: 0,
            paymentMethod: 'CORPORATE_CREDIT',
            status: 'PLACED',
            paymentStatus: 'CREDIT',
            isCreditPurchase: true,
            purchaseOrderId: po.id,
            orderNumber: `ORD-PO-${Date.now().toString().slice(-6)}`
          }
        });
        
        await NotificationService.sendShippingUpdate(po.user.email || '', po.user.phone || 'N/A', order.orderNumber, 'PLACED');
      }
    }

    res.status(200).json({ success: true, data: po });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
