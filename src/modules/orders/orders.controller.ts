import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { NotificationService } from '../../utils/notifications';
import razorpay from '../../utils/razorpay';
import crypto from 'crypto';

// Generate a random order number
const generateOrderNumber = () => 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { addressId, paymentMethod, gstin, companyName, couponCode } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { variant: true } },
        user: { include: { company: true } }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const address = await prisma.address.findUnique({ where: { id: parseInt(addressId) } });
    if (!address) {
      return res.status(400).json({ success: false, message: 'Invalid address' });
    }

    // Calculate subtotal and apply contract pricing if applicable
    let subtotal = 0;
    
    // Fetch contracts if user is in a company
    let contracts: any[] = [];
    if (cart.user?.companyId) {
      contracts = await prisma.companyContract.findMany({
        where: { companyId: cart.user.companyId, isActive: true }
      });
    }

    cart.items.forEach(item => {
      let currentPrice = parseFloat(item.variant.price.toString());
      if (contracts.length > 0) {
        const contract = contracts.find(c => c.productId === item.variant.productId);
        if (contract) currentPrice = parseFloat(contract.customPrice.toString());
      }
      subtotal += (currentPrice * item.quantity);
      // We attach the active price to the item so we can save it later
      (item as any).activePrice = currentPrice;
    });

    // ─── Coupon Validation & Discount ──────────────────────────────────────────
    let couponDiscount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() }
      });
      if (coupon && coupon.isActive) {
        const notExpired = !coupon.expiresAt || new Date() <= coupon.expiresAt;
        const notExhausted = coupon.maxUses === null || coupon.usedCount < coupon.maxUses;
        const meetsMinimum = !coupon.minOrderValue || subtotal >= parseFloat(coupon.minOrderValue.toString());
        if (notExpired && notExhausted && meetsMinimum) {
          const val = parseFloat(coupon.value.toString());
          couponDiscount = coupon.type === 'PERCENTAGE'
            ? (subtotal * val) / 100
            : Math.min(val, subtotal);
          couponDiscount = parseFloat(couponDiscount.toFixed(2));
          appliedCouponCode = coupon.code;
          // Increment used count
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
        }
      }
    }

    // ─── Tax Calculation ─────────────────────────────────────────────────────
    const taxableAmount = subtotal - couponDiscount;
    const taxAmount = taxableAmount * 0.18;
    let cgst = 0, sgst = 0, igst = 0;
    if (address.state.toLowerCase().includes('telangana')) {
      cgst = taxAmount / 2;
      sgst = taxAmount / 2;
    } else {
      igst = taxAmount;
    }

    const shippingFee = subtotal > 5000 ? 0 : 250;
    const total = taxableAmount + taxAmount + shippingFee;

    // ─── B2B Corporate Credit Logic ──────────────────────────────────────────
    if (paymentMethod === 'corporate_credit') {
      if (!cart.user.company) {
        return res.status(400).json({ success: false, message: 'You are not associated with a corporate account.' });
      }
      if (Number(cart.user.company.availableCredit) < total) {
        return res.status(400).json({ success: false, message: 'Insufficient corporate credit limit for this order.' });
      }
    }

    // Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: parseInt(addressId),
        paymentMethod: paymentMethod || 'cod',
        subtotal,
        discount: couponDiscount,
        tax: taxAmount,
        cgst,
        sgst,
        igst,
        gstin: gstin || null,
        companyName: companyName || null,
        couponCode: appliedCouponCode,
        couponDiscount,
        shippingFee,
        total,
        status: 'placed',
        items: {
          create: cart.items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            priceAtPurchase: (item as any).activePrice || item.variant.price
          }))
        },
        companyId: cart.user.companyId || null,
        isCreditPurchase: paymentMethod === 'corporate_credit'
      }
    });

    // Deduct Corporate Credit
    if (paymentMethod === 'corporate_credit' && cart.user.companyId) {
      await prisma.company.update({
        where: { id: cart.user.companyId },
        data: { availableCredit: { decrement: total } }
      });
    }


    // Optionally save GST info to user profile if not present
    if (gstin && companyName && (!cart.user.gstin || !cart.user.companyName)) {
      await prisma.user.update({
        where: { id: userId },
        data: { gstin, companyName }
      });
    }

    // Empty Cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Send Notification
    await NotificationService.sendOrderConfirmation(
      cart.user.email || '',
      cart.user.phone || 'N/A',
      order.orderNumber,
      total
    );

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        address: true,
        user: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Authorization: User can only view their own invoice (admin can view any, but this is a user route)
    if (order.userId !== userId) {
      // In a real app we might check if user is admin too
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const html = `
      <html>
        <head>
          <title>Tax Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #e11d48; font-size: 28px; font-weight: 900; }
            .title { text-align: right; }
            .title h2 { margin: 0; font-size: 24px; color: #555; }
            .info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 14px; }
            th { background-color: #f9fafb; font-weight: bold; }
            .totals { width: 40%; margin-left: auto; }
            .totals th, .totals td { border: none; padding: 8px; }
            .totals th { text-align: left; }
            .totals td { text-align: right; }
            .totals .grand-total { font-weight: 900; font-size: 18px; color: #e11d48; border-top: 2px solid #333; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>HINCHI ENTERPRISE</h1>
              <p style="margin: 5px 0; font-size: 12px; color: #777;">B2B Supply Solutions</p>
            </div>
            <div class="title">
              <h2>TAX INVOICE</h2>
              <p>Invoice #: INV-${order.orderNumber}<br>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="info">
            <div>
              <strong>Billed To:</strong><br>
              ${order.companyName ? order.companyName + '<br>' : ''}
              ${order.user.name}<br>
              ${order.address.line1}, ${order.address.line2 ? order.address.line2 + ', ' : ''}<br>
              ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br>
              ${order.gstin ? '<strong>GSTIN:</strong> ' + order.gstin : ''}
            </div>
            <div style="text-align: right;">
              <strong>Shipped To:</strong><br>
              Same as Billing Address
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td>${item.variant.product.name} <br><span style="font-size: 11px; color: #888;">SKU: ${item.variant.sku}</span></td>
                  <td>${item.quantity}</td>
                  <td>₹${parseFloat(item.priceAtPurchase).toLocaleString('en-IN')}</td>
                  <td>₹${(item.quantity * parseFloat(item.priceAtPurchase)).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <th>Subtotal:</th>
              <td>₹${parseFloat(order.subtotal as any).toLocaleString('en-IN')}</td>
            </tr>
            ${parseFloat(order.cgst as any) > 0 ? `
              <tr>
                <th>CGST (9%):</th>
                <td>₹${parseFloat(order.cgst as any).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <th>SGST (9%):</th>
                <td>₹${parseFloat(order.sgst as any).toLocaleString('en-IN')}</td>
              </tr>
            ` : ''}
            ${parseFloat(order.igst as any) > 0 ? `
              <tr>
                <th>IGST (18%):</th>
                <td>₹${parseFloat(order.igst as any).toLocaleString('en-IN')}</td>
              </tr>
            ` : ''}
            <tr>
              <th>Shipping Fee:</th>
              <td>₹${parseFloat(order.shippingFee as any).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="grand-total">
              <th>Total Amount:</th>
              <td>₹${parseFloat(order.total as any).toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888; text-align: center;">
            This is a computer-generated invoice and does not require a signature.<br>
            Thank you for your business!
          </div>
        </body>
      </html>
    `;

    res.send(html);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RAZORPAY: Create Razorpay Order ──────────────────────────────────────────
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body; // Amount in INR (e.g., 500.00)
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(parseFloat(amount) * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment gateway error' });
  }
};

// ─── RAZORPAY: Verify Payment & Update Order ──────────────────────────────────
export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // 1. Verify HMAC Signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    // 2. Fetch the order
    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 3. Create Payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'razorpay',
        providerTxnId: razorpay_payment_id,
        amount: order.total,
        status: 'PAID',
      },
    });

    // 4. Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID' },
    });

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { orderNumber: order.orderNumber },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
