"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMaintenanceRecord = exports.getMaintenanceRecords = exports.updateBookingStatus = exports.getRentalBookings = exports.configureRentalProduct = exports.getRentalProducts = exports.getRentalsOverview = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Dashboard & Overview ────────────────────────────────────────────────────
const getRentalsOverview = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const activeBookings = await prisma.rentalBooking.count({
            where: { vendorId, status: 'ACTIVE' }
        });
        const upcomingBookings = await prisma.rentalBooking.count({
            where: { vendorId, status: 'PENDING' }
        });
        // Calculate total deposits held
        const heldDepositsResult = await prisma.rentalBooking.findMany({
            where: { vendorId, depositStatus: 'HELD' },
            include: { product: { include: { rentalDetails: true } } }
        });
        const totalDeposits = heldDepositsResult.reduce((sum, b) => sum + Number(b.product.rentalDetails?.securityDeposit || 0), 0);
        const openMaintenance = await prisma.maintenanceRecord.count({
            where: { vendorId, status: 'OPEN' }
        });
        res.status(200).json({
            success: true,
            data: {
                activeBookings,
                upcomingBookings,
                totalDeposits,
                openMaintenance
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRentalsOverview = getRentalsOverview;
// ─── Rental Inventory ────────────────────────────────────────────────────────
const getRentalProducts = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const products = await prisma.product.findMany({
            where: { vendorId, isRentable: true },
            include: { rentalDetails: true }
        });
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRentalProducts = getRentalProducts;
const configureRentalProduct = async (req, res) => {
    try {
        const { productId, dailyRate, securityDeposit, minDays } = req.body;
        const product = await prisma.product.update({
            where: { id: parseInt(productId, 10) },
            data: {
                isRentable: true,
                rentalDetails: {
                    upsert: {
                        create: { dailyRate, securityDeposit, minDays },
                        update: { dailyRate, securityDeposit, minDays }
                    }
                }
            },
            include: { rentalDetails: true }
        });
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.configureRentalProduct = configureRentalProduct;
// ─── Bookings ────────────────────────────────────────────────────────────────
const getRentalBookings = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const bookings = await prisma.rentalBooking.findMany({
            where: { vendorId },
            include: { product: { select: { name: true } } },
            orderBy: { startDate: 'asc' }
        });
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRentalBookings = getRentalBookings;
const updateBookingStatus = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id, 10);
        const { status, depositStatus } = req.body;
        const booking = await prisma.rentalBooking.update({
            where: { id: bookingId },
            data: {
                ...(status && { status }),
                ...(depositStatus && { depositStatus })
            }
        });
        res.status(200).json({ success: true, data: booking });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBookingStatus = updateBookingStatus;
// ─── Maintenance & Damages ───────────────────────────────────────────────────
const getMaintenanceRecords = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const records = await prisma.maintenanceRecord.findMany({
            where: { vendorId },
            include: { product: { select: { name: true } } },
            orderBy: { reportedAt: 'desc' }
        });
        res.status(200).json({ success: true, data: records });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMaintenanceRecords = getMaintenanceRecords;
const addMaintenanceRecord = async (req, res) => {
    try {
        const { vendorId, productId, type, description, cost } = req.body;
        const record = await prisma.maintenanceRecord.create({
            data: {
                vendorId: parseInt(vendorId, 10),
                productId: parseInt(productId, 10),
                type,
                description,
                cost: cost ? parseFloat(cost) : null
            }
        });
        res.status(201).json({ success: true, data: record });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addMaintenanceRecord = addMaintenanceRecord;
//# sourceMappingURL=vendor-rentals.controller.js.map