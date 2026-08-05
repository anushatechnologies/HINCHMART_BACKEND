import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { emitOrderStatusChange } from '../../socket';

const prisma = new PrismaClient();

export const getVendorOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // We get the vendorId from req.user (JWT), fallback to query for backward compatibility during dev if needed
    const vendorId = (req as any).user?.id || parseInt(req.query.vendorId as string, 10);

    if (!vendorId || isNaN(vendorId)) {
      res.status(401).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        vendorId: vendorId
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            status: true,
            total: true,
            companyName: true,
            user: {
              select: {
                name: true,
                email: true,
                companyName: true
              }
            }
          }
        },
        variant: {
          include: {
            product: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });

    res.status(200).json({
      success: true,
      data: orderItems
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendor orders', error: error.message });
  }
};

export const updateOrderItemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const { status, trackingNumber, courierName } = req.body;

    if (isNaN(itemId)) {
      res.status(400).json({ success: false, message: 'Invalid item ID' });
      return;
    }

    const updatedItem = await prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findUnique({ where: { id: itemId }, include: { variant: true } });
      if (!item) throw new Error("Order item not found");

      // Deplete inventory when SHIPPED
      if (status === 'SHIPPED' && item.status !== 'SHIPPED') {
        if (item.variant) {
          const newStock = Math.max(0, item.variant.stockQty - item.quantity);
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: newStock }
          });
          
          // Optionally trigger Low Stock Alert here if newStock < threshold
          if (newStock <= 5) {
            // NotificationService.sendLowStockAlert(...)
            console.log(`[ALERT] Variant ${item.variant.sku} is low on stock (${newStock} remaining)`);
          }
        }
      }

      // Generate EscrowHold when DELIVERED (Replaces basic VendorSettlement)
      if (status === 'DELIVERED' && item.status !== 'DELIVERED') {
        const itemGross = Number(item.priceAtPurchase) * item.quantity;
        const commission = itemGross * 0.10; // 10% flat commission
        const tds = itemGross * 0.01; // 1% TDS
        const tcs = itemGross * 0.01; // 1% TCS
        const itemNet = itemGross - commission - tds - tcs;
        
        const holdUntilDate = new Date();
        holdUntilDate.setDate(holdUntilDate.getDate() + 7); // 7-day return window

        // Check if an escrow hold for this order and vendor already exists
        const existingEscrow = await tx.escrowHold.findFirst({
          where: { orderId: item.orderId, vendorId: item.vendorId }
        });

        if (existingEscrow) {
          await tx.escrowHold.update({
            where: { id: existingEscrow.id },
            data: {
              grossAmount: Number(existingEscrow.grossAmount) + itemGross,
              commissionAmount: Number(existingEscrow.commissionAmount) + commission,
              tdsAmount: Number(existingEscrow.tdsAmount) + tds,
              tcsAmount: Number(existingEscrow.tcsAmount) + tcs,
              netPayoutAmount: Number(existingEscrow.netPayoutAmount) + itemNet,
            }
          });
        } else {
          await tx.escrowHold.create({
            data: {
              vendorId: item.vendorId,
              orderId: item.orderId,
              grossAmount: itemGross,
              commissionAmount: commission,
              tdsAmount: tds,
              tcsAmount: tcs,
              netPayoutAmount: itemNet,
              holdUntilDate: holdUntilDate,
              escrowStatus: 'HELD'
            }
          });
        }
      }

      return tx.orderItem.update({
        where: { id: itemId },
        data: {
          status,
          ...(trackingNumber && { trackingNumber }),
          ...(courierName && { courierName })
        },
        include: { order: { select: { userId: true } } }
      });
    });

    // Broadcast socket event to real-time clients
    emitOrderStatusChange(updatedItem.orderId, status, updatedItem.order.userId);

    res.status(200).json({
      success: true,
      message: 'Order item updated successfully',
      data: updatedItem
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update order item', error: error.message });
  }
};

export const generateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const vendorId = (req as any).user?.id;

    if (isNaN(itemId)) {
      res.status(400).json({ success: false, message: 'Invalid item ID' });
      return;
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: { id: itemId, vendorId },
      include: {
        order: {
          include: {
            user: true,
            address: true
          }
        },
        variant: {
          include: {
            product: true
          }
        },
        vendor: true
      }
    });

    if (!orderItem) {
      res.status(404).json({ success: false, message: 'Order item not found' });
      return;
    }

    // Generate basic HTML Invoice string
    const htmlInvoice = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .details { margin-top: 30px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TAX INVOICE</h1>
            <p>${orderItem.vendor?.companyName || 'Vendor'}</p>
          </div>
          <div class="details">
            <div>
              <h3>Billed To:</h3>
              <p>${orderItem.order.companyName || orderItem.order.user.name}</p>
              <p>${orderItem.order.address.addressLine1}, ${orderItem.order.address.city}</p>
            </div>
            <div>
              <h3>Invoice Details:</h3>
              <p><strong>Order #:</strong> ${orderItem.order.orderNumber}</p>
              <p><strong>Date:</strong> ${new Date(orderItem.order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${orderItem.variant.product.name}</td>
                <td>${orderItem.variant.sku}</td>
                <td>${orderItem.quantity}</td>
                <td>₹${Number(orderItem.priceAtPurchase).toFixed(2)}</td>
                <td>₹${(Number(orderItem.priceAtPurchase) * orderItem.quantity).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top:40px; text-align:center;">Thank you for your business!</p>
        </body>
      </html>
    `;

    res.status(200).send(htmlInvoice);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to generate invoice', error: error.message });
  }
};
