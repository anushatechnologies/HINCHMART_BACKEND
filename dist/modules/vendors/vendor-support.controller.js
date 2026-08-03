"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendChatMessage = exports.getChatMessages = exports.updateTicketStatus = exports.getSupportTickets = exports.updateReturnStatus = exports.getReturnRequests = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Returns & Refunds ───────────────────────────────────────────────────────
const getReturnRequests = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const returns = await prisma.returnRequest.findMany({
            where: { vendorId },
            include: { order: { select: { orderNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: returns });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getReturnRequests = getReturnRequests;
const updateReturnStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body; // APPROVED, REJECTED, REFUNDED
        const returnReq = await prisma.returnRequest.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ success: true, data: returnReq });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateReturnStatus = updateReturnStatus;
// ─── Support Tickets ─────────────────────────────────────────────────────────
const getSupportTickets = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const tickets = await prisma.vendorSupportTicket.findMany({
            where: { vendorId },
            include: { order: { select: { orderNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: tickets });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSupportTickets = getSupportTickets;
const updateTicketStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body; // IN_PROGRESS, RESOLVED, CLOSED
        const ticket = await prisma.vendorSupportTicket.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ success: true, data: ticket });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateTicketStatus = updateTicketStatus;
// ─── Live Chat & Messages ────────────────────────────────────────────────────
const getChatMessages = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const messages = await prisma.vendorChatMessage.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json({ success: true, data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getChatMessages = getChatMessages;
const sendChatMessage = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        const { content } = req.body;
        const message = await prisma.vendorChatMessage.create({
            data: {
                vendorId,
                senderId: `VEND_${vendorId}`,
                senderType: 'VENDOR',
                content
            }
        });
        res.status(201).json({ success: true, data: message });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.sendChatMessage = sendChatMessage;
//# sourceMappingURL=vendor-support.controller.js.map