"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = exports.deleteCoupon = exports.createCoupon = exports.getCoupons = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Admin: List all coupons ───────────────────────────────────────────────────
const getCoupons = async (req, res) => {
    try {
        const coupons = await prisma_1.default.coupon.findMany({ orderBy: { id: 'desc' } });
        res.json({ success: true, data: coupons });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCoupons = getCoupons;
// ─── Admin: Create coupon ──────────────────────────────────────────────────────
const createCoupon = async (req, res) => {
    try {
        const { code, type, value, minOrderValue, maxUses, expiresAt } = req.body;
        if (!code || !type || !value) {
            return res.status(400).json({ success: false, message: 'code, type and value are required' });
        }
        const coupon = await prisma_1.default.coupon.create({
            data: {
                code: code.trim().toUpperCase(),
                type, // 'PERCENTAGE' or 'FIXED'
                value: parseFloat(value),
                minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: true
            }
        });
        res.status(201).json({ success: true, data: coupon });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCoupon = createCoupon;
// ─── Admin: Delete coupon ──────────────────────────────────────────────────────
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.coupon.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Coupon deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCoupon = deleteCoupon;
// ─── Storefront: Validate & Preview coupon discount ───────────────────────────
// POST /api/coupons/validate  { code, subtotal }
const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }
        const coupon = await prisma_1.default.coupon.findUnique({
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
        }
        else {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.validateCoupon = validateCoupon;
//# sourceMappingURL=coupons.controller.js.map