import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { NotificationService } from '../../utils/notifications';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, ordersToday, totalRevenue, totalProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.product.count()
    ]);

    // Fetch recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        ordersToday,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        recentOrders
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { 
        user: true,
        items: { include: { variant: { include: { product: { include: { vendor: true } } } } } }
      }
    });

    // Phase 19: Commission Engine (Trigger on DELIVERED)
    if (status === 'DELIVERED') {
      for (const item of order.items) {
        const vendor = item.variant.product.vendor;
        if (vendor) {
          // Check if settlement already exists to prevent duplicates
          const existing = await prisma.vendorSettlement.findFirst({
            where: { orderId: order.id, vendorId: vendor.id }
          });

          if (!existing) {
            const grossAmount = Number(item.priceAtPurchase) * item.quantity;
            const commissionRate = Number(vendor.commissionRate);
            const commissionAmount = (grossAmount * commissionRate) / 100;
            // Phase 23: Deduct 1% TDS as per Section 194-O
            const tdsAmount = grossAmount * 0.01;
            const netAmount = grossAmount - commissionAmount - tdsAmount;

            await prisma.vendorSettlement.create({
              data: {
                vendorId: vendor.id,
                orderId: order.id,
                grossAmount,
                commissionAmount,
                tdsAmount,
                netAmount,
                status: 'PENDING'
              }
            });
          }
        }
      }
    }

    // Phase 23: Handle Returns & Credit Notes
    if (status === 'RETURNED') {
      if (order.isCreditPurchase && order.companyId) {
        // Restore B2B Corporate Credit
        await prisma.company.update({
          where: { id: order.companyId },
          data: { availableCredit: { increment: order.total } }
        });

        // Generate Credit Note
        await prisma.creditNote.create({
          data: {
            companyId: order.companyId,
            orderId: order.id,
            amount: order.total,
            reason: 'Order Returned'
          }
        });
      }
    }

    await NotificationService.sendShippingUpdate(order.user.email || '', order.user.phone || 'N/A', order.orderNumber, status);

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true, email: true } },
        address: true,
        deliveryPartner: true,
        items: { include: { variant: { include: { product: true } } } }
      }
    });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCreditNotes = async (req: Request, res: Response) => {
  try {
    const notes = await prisma.creditNote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
        order: { select: { orderNumber: true } }
      }
    });
    res.json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardChartData = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chartData = [];

    // Loop through the last 7 days
    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date(today);
      startOfDay.setDate(today.getDate() - i);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(startOfDay.getDate() + 1);

      // Fetch aggregated data for that day
      const dailyStats = await prisma.order.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: { not: 'CANCELLED' }
        }
      });

      const dayName = startOfDay.toLocaleDateString('en-US', { weekday: 'short' });
      chartData.push({
        name: dayName,
        revenue: dailyStats._sum.total ? parseFloat(dailyStats._sum.total.toString()) : 0,
        orders: dailyStats._count.id
      });
    }

    res.json({ success: true, data: chartData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerErpSync = async (req: Request, res: Response): Promise<void> => {
  try {
    const { system } = req.body;
    // Simulate a background job that actually syncs with SAP/Oracle
    // We would insert a job into a queue like BullMQ here
    res.json({ success: true, message: `ERP sync for ${system} initiated in the background` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
