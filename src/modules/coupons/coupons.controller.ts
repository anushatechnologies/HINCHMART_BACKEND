import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

// ─── Admin: List all coupons ───────────────────────────────────────────────────
export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { id: 'desc' } });
    res.json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Create coupon ──────────────────────────────────────────────────────
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, type, value, minOrderValue, maxUses, expiresAt } = req.body;
    if (!code || !type || !value) {
      return res.status(400).json({ success: false, message: 'code, type and value are required' });
    }
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,   // 'PERCENTAGE' or 'FIXED'
        value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      }
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Delete coupon ──────────────────────────────────────────────────────
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Storefront: Validate & Preview coupon discount ───────────────────────────
// POST /api/coupons/validate  { code, subtotal }
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    // --- Validation checks ---
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    }
    const orderSubtotal = parseFloat(subtotal || '0');
    if (coupon.minOrderValue && orderSubtotal < parseFloat(coupon.minOrderValue.toString())) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
      });
    }

    // --- Calculate discount ---
    let discountAmount = 0;
    const couponValue = parseFloat(coupon.value.toString());
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (orderSubtotal * couponValue) / 100;
    } else {
      discountAmount = Math.min(couponValue, orderSubtotal); // can't discount more than subtotal
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: couponValue,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        message: coupon.type === 'PERCENTAGE'
          ? `${couponValue}% off applied — You save ₹${discountAmount.toFixed(2)}!`
          : `₹${couponValue} flat discount applied!`
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
