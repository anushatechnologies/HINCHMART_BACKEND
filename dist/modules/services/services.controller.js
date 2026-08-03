"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceBookingStatus = exports.getVendorServiceBookings = exports.getMyServiceBookings = exports.createServiceBooking = exports.getServiceById = exports.getServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// GET /api/services — list all service offerings
const getServices = async (req, res) => {
    try {
        const { category, page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = { isActive: true };
        const [services, total] = await Promise.all([
            prisma_1.default.serviceOffering.findMany({
                where,
                include: { vendor: { select: { companyName: true, id: true } } },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.serviceOffering.count({ where }),
        ]);
        return res.json({ success: true, data: services, total });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getServices = getServices;
// GET /api/services/:id — get single service details
const getServiceById = async (req, res) => {
    try {
        const service = await prisma_1.default.serviceOffering.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                vendor: { select: { companyName: true, id: true } },
                bookings: { select: { id: true, status: true } }
            },
        });
        if (!service)
            return res.status(404).json({ success: false, message: 'Service not found' });
        return res.json({ success: true, data: service });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getServiceById = getServiceById;
// POST /api/services/bookings — create a service booking
const createServiceBooking = async (req, res) => {
    try {
        const { serviceId, scheduledDate, timeSlot, serviceAddress, customerName } = req.body;
        if (!serviceId || !scheduledDate || !serviceAddress) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const service = await prisma_1.default.serviceOffering.findUnique({ where: { id: parseInt(serviceId) } });
        if (!service)
            return res.status(404).json({ success: false, message: 'Service not found' });
        const booking = await prisma_1.default.serviceBooking.create({
            data: {
                serviceId: parseInt(serviceId),
                customerName: customerName || req.user?.name || 'Customer',
                vendorId: service.vendorId,
                scheduledDate: new Date(scheduledDate),
                timeSlot: timeSlot || '09:00 - 11:00',
                serviceAddress,
                status: 'CONFIRMED',
                totalAmount: service.price,
            },
            include: { serviceOffering: true },
        });
        return res.status(201).json({ success: true, data: booking });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createServiceBooking = createServiceBooking;
// GET /api/services/my-bookings — customer: list my bookings
const getMyServiceBookings = async (req, res) => {
    try {
        const customerName = req.user?.name || '';
        const bookings = await prisma_1.default.serviceBooking.findMany({
            where: { customerName },
            include: { serviceOffering: true },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: bookings });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMyServiceBookings = getMyServiceBookings;
// GET /api/services/vendor/bookings — vendor: list their service bookings
const getVendorServiceBookings = async (req, res) => {
    try {
        const vendorId = req.vendor?.id;
        if (!vendorId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const { status } = req.query;
        const where = { vendorId };
        if (status)
            where.status = status;
        const bookings = await prisma_1.default.serviceBooking.findMany({
            where,
            include: { serviceOffering: true },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: bookings });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getVendorServiceBookings = getVendorServiceBookings;
// PATCH /api/services/bookings/:id/status — vendor: update booking status
const updateServiceBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await prisma_1.default.serviceBooking.update({
            where: { id: parseInt(req.params.id) },
            data: { status },
        });
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateServiceBookingStatus = updateServiceBookingStatus;
//# sourceMappingURL=services.controller.js.map