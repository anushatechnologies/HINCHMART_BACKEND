"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceBooking = exports.getServiceBookings = exports.createServiceArea = exports.getServiceAreas = exports.createTimeSlot = exports.getTimeSlots = exports.createServiceOffering = exports.getServiceOfferings = exports.getServicesOverview = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Dashboard Overview ──────────────────────────────────────────────────────
const getServicesOverview = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const activeServices = await prisma.serviceOffering.count({ where: { vendorId, isActive: true } });
        const upcomingBookings = await prisma.serviceBooking.count({ where: { vendorId, status: 'CONFIRMED' } });
        const completedBookings = await prisma.serviceBooking.count({ where: { vendorId, status: 'COMPLETED' } });
        const activeAreas = await prisma.serviceArea.count({ where: { vendorId, isActive: true } });
        res.status(200).json({
            success: true,
            data: { activeServices, upcomingBookings, completedBookings, activeAreas }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getServicesOverview = getServicesOverview;
// ─── Service Offerings ───────────────────────────────────────────────────────
const getServiceOfferings = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const services = await prisma.serviceOffering.findMany({ where: { vendorId } });
        res.status(200).json({ success: true, data: services });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getServiceOfferings = getServiceOfferings;
const createServiceOffering = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        const { name, description, price, durationMin } = req.body;
        const service = await prisma.serviceOffering.create({
            data: { vendorId, name, description, price: parseFloat(price), durationMin: parseInt(durationMin, 10) }
        });
        res.status(201).json({ success: true, data: service });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createServiceOffering = createServiceOffering;
// ─── Time Slots ──────────────────────────────────────────────────────────────
const getTimeSlots = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const slots = await prisma.serviceTimeSlot.findMany({ where: { vendorId }, orderBy: { dayOfWeek: 'asc' } });
        res.status(200).json({ success: true, data: slots });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTimeSlots = getTimeSlots;
const createTimeSlot = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        const { dayOfWeek, startTime, endTime } = req.body;
        const slot = await prisma.serviceTimeSlot.create({
            data: { vendorId, dayOfWeek: parseInt(dayOfWeek, 10), startTime, endTime }
        });
        res.status(201).json({ success: true, data: slot });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createTimeSlot = createTimeSlot;
// ─── Service Areas ───────────────────────────────────────────────────────────
const getServiceAreas = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const areas = await prisma.serviceArea.findMany({ where: { vendorId } });
        res.status(200).json({ success: true, data: areas });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getServiceAreas = getServiceAreas;
const createServiceArea = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        const { pincode, city } = req.body;
        const area = await prisma.serviceArea.create({
            data: { vendorId, pincode, city }
        });
        res.status(201).json({ success: true, data: area });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createServiceArea = createServiceArea;
// ─── Bookings ────────────────────────────────────────────────────────────────
const getServiceBookings = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const bookings = await prisma.serviceBooking.findMany({
            where: { vendorId },
            include: { serviceOffering: { select: { name: true, price: true } } },
            orderBy: { scheduledDate: 'asc' }
        });
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getServiceBookings = getServiceBookings;
const updateServiceBooking = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body;
        const booking = await prisma.serviceBooking.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ success: true, data: booking });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateServiceBooking = updateServiceBooking;
//# sourceMappingURL=vendor-services.controller.js.map