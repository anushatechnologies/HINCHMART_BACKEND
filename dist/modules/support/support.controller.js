"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentReplyToTicket = exports.updateTicketStatus = exports.getAllTickets = exports.replyToTicket = exports.getMyTickets = exports.createTicket = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Customer: Create a support ticket ────────────────────────────────────────
const createTicket = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { name, email, subject, category, priority, body } = req.body;
        if (!name || !email || !subject || !body) {
            return res.status(400).json({ success: false, message: 'name, email, subject and body are required' });
        }
        const ticket = await prisma_1.default.supportTicket.create({
            data: {
                userId,
                name,
                email,
                subject,
                category: category || 'GENERAL',
                priority: priority || 'MEDIUM',
                messages: {
                    create: { senderType: 'CUSTOMER', senderName: name, body }
                }
            },
            include: { messages: true }
        });
        return res.status(201).json({ success: true, data: ticket, message: `Ticket #${ticket.id} created. We'll respond within 24 hours.` });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.createTicket = createTicket;
// ─── Customer: Get my tickets ─────────────────────────────────────────────────
const getMyTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await prisma_1.default.supportTicket.findMany({
            where: { userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
            orderBy: { updatedAt: 'desc' }
        });
        return res.json({ success: true, data: tickets });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMyTickets = getMyTickets;
// ─── Customer: Reply to ticket ────────────────────────────────────────────────
const replyToTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const { body } = req.body;
        const ticket = await prisma_1.default.supportTicket.findFirst({
            where: { id: parseInt(req.params.id), userId }
        });
        if (!ticket)
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        const message = await prisma_1.default.supportMessage.create({
            data: { ticketId: ticket.id, senderType: 'CUSTOMER', senderName: ticket.name, body }
        });
        await prisma_1.default.supportTicket.update({ where: { id: ticket.id }, data: { status: 'OPEN' } });
        return res.status(201).json({ success: true, data: message });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.replyToTicket = replyToTicket;
// ─── Admin: Get all tickets ───────────────────────────────────────────────────
const getAllTickets = async (req, res) => {
    try {
        const { status, priority, page = '1' } = req.query;
        const skip = (parseInt(page) - 1) * 20;
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        const [tickets, total] = await Promise.all([
            prisma_1.default.supportTicket.findMany({
                where,
                include: { messages: { orderBy: { createdAt: 'asc' } } },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: 20
            }),
            prisma_1.default.supportTicket.count({ where })
        ]);
        return res.json({ success: true, data: tickets, total });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllTickets = getAllTickets;
// ─── Admin: Update ticket status ─────────────────────────────────────────────
const updateTicketStatus = async (req, res) => {
    try {
        const { status, priority } = req.body;
        const ticket = await prisma_1.default.supportTicket.update({
            where: { id: parseInt(req.params.id) },
            data: { status, priority }
        });
        return res.json({ success: true, data: ticket });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateTicketStatus = updateTicketStatus;
// ─── Admin: Reply to ticket ───────────────────────────────────────────────────
const agentReplyToTicket = async (req, res) => {
    try {
        const { body, agentName } = req.body;
        const message = await prisma_1.default.supportMessage.create({
            data: {
                ticketId: parseInt(req.params.id),
                senderType: 'AGENT',
                senderName: agentName || 'HinchMart Support',
                body
            }
        });
        await prisma_1.default.supportTicket.update({
            where: { id: parseInt(req.params.id) },
            data: { status: 'IN_PROGRESS' }
        });
        return res.status(201).json({ success: true, data: message });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.agentReplyToTicket = agentReplyToTicket;
//# sourceMappingURL=support.controller.js.map