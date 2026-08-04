import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalyticsOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    // 1. Fetch OrderItems belonging to this vendor
    const orderItems = await prisma.orderItem.findMany({
      where: { vendorId },
      include: { order: true }
    });

    let totalGrossRevenue = 0;
    let totalOrders = orderItems.length;
    let completedOrders = 0;

    orderItems.forEach(item => {
      if (item.status !== 'CANCELLED' && item.status !== 'RETURNED') {
        const itemTotal = Number(item.priceAtPurchase) * item.quantity;
        totalGrossRevenue += itemTotal;
        completedOrders++;
      }
    });

    const aov = completedOrders > 0 ? (totalGrossRevenue / completedOrders) : 0;
    const netProfit = totalGrossRevenue * 0.85; // 15% platform commission

    // 2. Product Analytics
    const products = await prisma.product.findMany({
      where: { vendorId },
      include: { variants: true }
    });

    let totalInventoryValue = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      p.variants.forEach(v => {
        totalInventoryValue += (Number(v.price) * v.stockQty);
        if (v.stockQty < 10) lowStockCount++;
      });
    });

    // 3. Customer Count & Repeat Customers
    const userOrderCounts: Record<number, number> = {};
    orderItems.forEach(item => {
      const uid = item.order.userId;
      userOrderCounts[uid] = (userOrderCounts[uid] || 0) + 1;
    });
    const uniqueUserIds = Object.keys(userOrderCounts);
    const totalCustomers = uniqueUserIds.length;
    const repeatCustomers = Object.values(userOrderCounts).filter(count => count > 1).length;

    // 4. Rentals & Service Bookings
    const rentals = await prisma.rentalBooking.findMany({
      where: { vendorId },
      select: { totalAmount: true, status: true }
    });
    let activeRentals = 0;
    let rentalRevenue = 0;
    rentals.forEach(r => {
      if (r.status === 'ACTIVE') activeRentals++;
      if (r.status !== 'CANCELLED') rentalRevenue += Number(r.totalAmount);
    });

    const serviceBookings = await prisma.serviceBooking.findMany({
      where: { vendorId },
      select: { status: true, totalAmount: true }
    });
    let totalServiceBookings = serviceBookings.length;
    let serviceRevenue = 0;
    serviceBookings.forEach(sb => {
      if (sb.status !== 'CANCELLED') serviceRevenue += Number(sb.totalAmount);
    });

    // Construct final payload
    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalGrossRevenue,
          netProfit,
          totalOrders,
          aov
        },
        inventory: {
          totalProducts: products.length,
          totalInventoryValue,
          lowStockCount
        },
        customers: {
          totalCustomers,
          repeatCustomers
        },
        services: {
          activeRentals,
          rentalRevenue,
          totalServiceBookings,
          serviceRevenue
        },
        specialty: {
          activeRentals,
          rentalRevenue,
          totalServiceBookings,
          serviceRevenue
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};
