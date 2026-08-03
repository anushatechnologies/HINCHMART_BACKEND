"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippingOverview = exports.schedulePickup = exports.getPickupRequests = exports.addCourier = exports.getCouriers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Couriers ────────────────────────────────────────────────────────────────
const getCouriers = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const couriers = await prisma.vendorCourier.findMany({
            where: { vendorId }
        });
        res.status(200).json({ success: true, data: couriers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCouriers = getCouriers;
const addCourier = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        const { courierName, accountCode, isDefault } = req.body;
        if (isNaN(vendorId) || !courierName) {
            res.status(400).json({ success: false, message: 'vendorId and courierName are required' });
            return;
        }
        if (isDefault) {
            await prisma.vendorCourier.updateMany({
                where: { vendorId },
                data: { isDefault: false }
            });
        }
        const courier = await prisma.vendorCourier.create({
            data: {
                vendorId,
                courierName,
                accountCode,
                isDefault: isDefault || false
            }
        });
        res.status(201).json({ success: true, data: courier });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addCourier = addCourier;
// ─── Pickup Requests ─────────────────────────────────────────────────────────
const getPickupRequests = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const pickups = await prisma.pickupRequest.findMany({
            where: { vendorId },
            orderBy: { scheduledDate: 'desc' }
        });
        res.status(200).json({ success: true, data: pickups });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPickupRequests = getPickupRequests;
const schedulePickup = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        const { courierName, scheduledDate, orderItemIds } = req.body;
        if (isNaN(vendorId) || !courierName || !scheduledDate || !orderItemIds || !Array.isArray(orderItemIds)) {
            res.status(400).json({ success: false, message: 'Missing required pickup details' });
            return;
        }
        const pickup = await prisma.pickupRequest.create({
            data: {
                vendorId,
                courierName,
                scheduledDate: new Date(scheduledDate),
                orderItemIds
            }
        });
        res.status(201).json({ success: true, data: pickup });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.schedulePickup = schedulePickup;
// ─── Tracking & Labels ───────────────────────────────────────────────────────
const getShippingOverview = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        // Get Active Shipments (Status SHIPPED)
        const activeShipments = await prisma.orderItem.findMany({
            where: { vendorId, status: 'SHIPPED' },
            include: {
                order: { select: { orderNumber: true, user: { select: { name: true, email: true } } } },
                variant: { include: { product: { select: { name: true } } } }
            }
        });
        // Get Delivered Shipments
        const deliveredShipments = await prisma.orderItem.findMany({
            where: { vendorId, status: 'DELIVERED' },
            include: {
                order: { select: { orderNumber: true, user: { select: { name: true } } } },
                variant: { include: { product: { select: { name: true } } } }
            }
        });
        // Get Ready to Ship for Labels
        const readyToShip = await prisma.orderItem.findMany({
            where: { vendorId, status: { in: ['PACKED', 'READY_TO_SHIP'] } },
            include: {
                order: { select: { orderNumber: true, companyName: true, user: { select: { name: true } } } },
                variant: { include: { product: { select: { name: true, slug: true } } } }
            }
        });
        res.status(200).json({
            success: true,
            data: {
                activeShipments,
                deliveredShipments,
                readyToShip
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getShippingOverview = getShippingOverview;
//# sourceMappingURL=vendor-shipping.controller.js.map