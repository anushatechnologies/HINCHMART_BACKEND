"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeSession = exports.getAllSessionsAdmin = exports.sendMessage = exports.getSession = exports.startSession = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Customer: Start Chat Session ─────────────────────────────────────────────
const startSession = async (req, res) => {
    try {
        const { name, email, visitorId } = req.body;
        const userId = req.user?.id || null;
        // Check for existing active session for this visitor or user
        let session;
        if (userId) {
            session = await prisma_1.default.chatSession.findFirst({ where: { userId, status: { in: ['WAITING', 'ACTIVE'] } } });
        }
        else if (visitorId) {
            session = await prisma_1.default.chatSession.findFirst({ where: { visitorId, status: { in: ['WAITING', 'ACTIVE'] } } });
        }
        if (!session) {
            session = await prisma_1.default.chatSession.create({
                data: {
                    name,
                    email,
                    userId,
                    visitorId: visitorId || null,
                    status: 'WAITING',
                    messages: JSON.stringify([
                        { role: 'SYSTEM', content: 'Connecting you to the next available agent...', ts: new Date() }
                    ])
                }
            });
        }
        return res.status(201).json({ success: true, data: session });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.startSession = startSession;
// ─── Customer: Get Chat Session ───────────────────────────────────────────────
const getSession = async (req, res) => {
    try {
        const session = await prisma_1.default.chatSession.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!session)
            return res.status(404).json({ success: false, message: 'Session not found' });
        // Parse messages
        const messages = typeof session.messages === 'string' ? JSON.parse(session.messages) : session.messages;
        return res.json({ success: true, data: { ...session, messages } });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSession = getSession;
// ─── Customer/Admin: Send Message ─────────────────────────────────────────────
const sendMessage = async (req, res) => {
    try {
        const { role, content } = req.body;
        const session = await prisma_1.default.chatSession.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!session)
            return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.status === 'CLOSED')
            return res.status(400).json({ success: false, message: 'Session is closed' });
        let messages = typeof session.messages === 'string' ? JSON.parse(session.messages) : session.messages;
        if (!Array.isArray(messages))
            messages = [];
        messages.push({ role, content, ts: new Date() });
        const updated = await prisma_1.default.chatSession.update({
            where: { id: session.id },
            data: {
                messages: JSON.stringify(messages),
                status: role === 'AGENT' ? 'ACTIVE' : session.status
            }
        });
        return res.json({ success: true, data: { ...updated, messages } });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.sendMessage = sendMessage;
// ─── Admin: Get all sessions ──────────────────────────────────────────────────
const getAllSessionsAdmin = async (req, res) => {
    try {
        const sessions = await prisma_1.default.chatSession.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        const parsedSessions = sessions.map(s => ({
            ...s,
            messages: typeof s.messages === 'string' ? JSON.parse(s.messages) : s.messages
        }));
        return res.json({ success: true, data: parsedSessions });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllSessionsAdmin = getAllSessionsAdmin;
// ─── Admin: Close Session ─────────────────────────────────────────────────────
const closeSession = async (req, res) => {
    try {
        const session = await prisma_1.default.chatSession.update({
            where: { id: parseInt(req.params.id) },
            data: { status: 'CLOSED' }
        });
        return res.json({ success: true, data: session });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.closeSession = closeSession;
//# sourceMappingURL=chat.controller.js.map