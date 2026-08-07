"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRfqMessages = exports.getRfqDetails = exports.createQuote = exports.getMyRfqs = exports.getRfqs = exports.createRfq = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const socket_1 = require("../../socket");
const createRfq = async (req, res) => {
    try {
        const { items, notes, boqUrl } = req.body;
        // Assume user is authenticated and we have req.user.id
        // For MVP, we'll hardcode or take from body if no auth middleware
        const userId = req.body.userId || 1; // Fallback to 1 for testing
        const rfqNumber = `RFQ-${Date.now().toString().slice(-6)}`;
        const rfq = await prisma_1.default.rfq.create({
            data: {
                userId,
                rfqNumber,
                notes,
                boqUrl,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId || null,
                        productName: item.productName || 'Unknown Product',
                        quantity: parseInt(item.quantity, 10) || 1,
                        targetPrice: item.targetPrice ? parseFloat(item.targetPrice) : null,
                    })),
                },
            },
            include: {
                items: true,
            },
        });
        res.status(201).json({ success: true, message: 'RFQ submitted successfully', data: rfq });
    }
    catch (error) {
        console.error('Error creating RFQ:', error);
        res.status(500).json({ success: false, message: 'Failed to create RFQ', error: error.message });
    }
};
exports.createRfq = createRfq;
const getRfqs = async (req, res) => {
    try {
        const rfqs = await prisma_1.default.rfq.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true } }
                    }
                },
                quotes: {
                    include: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: rfqs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch RFQs', error: error.message });
    }
};
exports.getRfqs = getRfqs;
const getMyRfqs = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // Assuming auth middleware sets req.user
        const rfqs = await prisma_1.default.rfq.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true } }
                    }
                },
                quotes: {
                    include: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: rfqs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch your RFQs', error: error.message });
    }
};
exports.getMyRfqs = getMyRfqs;
const createQuote = async (req, res) => {
    try {
        const rfqId = parseInt(req.params.id, 10);
        const { items, notes, validUntil } = req.body;
        // items should be [{ rfqItemId, unitPrice, remarks }]
        if (!rfqId) {
            res.status(400).json({ success: false, message: 'Invalid RFQ ID' });
            return;
        }
        let totalAmount = 0;
        const quoteItemsData = items.map((item) => {
            const qty = item.quantity || 1;
            const total = parseFloat(item.unitPrice) * qty;
            totalAmount += total;
            return {
                rfqItemId: parseInt(item.rfqItemId, 10),
                unitPrice: parseFloat(item.unitPrice),
                totalPrice: total,
                remarks: item.remarks
            };
        });
        const quote = await prisma_1.default.quote.create({
            data: {
                rfqId,
                totalAmount,
                notes,
                validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
                items: {
                    create: quoteItemsData
                }
            },
            include: {
                items: true
            }
        });
        // Update RFQ status
        await prisma_1.default.rfq.update({
            where: { id: rfqId },
            data: { status: 'QUOTED' }
        });
        // Broadcast socket event to RFQ room
        (0, socket_1.emitRfqQuoteUpdate)(rfqId, quote);
        res.status(201).json({ success: true, message: 'Quote generated successfully', data: quote });
    }
    catch (error) {
        console.error('Error creating Quote:', error);
        res.status(500).json({ success: false, message: 'Failed to create quote', error: error.message });
    }
};
exports.createQuote = createQuote;
const getRfqDetails = async (req, res) => {
    try {
        const rfqId = parseInt(req.params.id, 10);
        const rfq = await prisma_1.default.rfq.findUnique({
            where: { id: rfqId },
            include: {
                items: { include: { product: { select: { id: true, name: true, images: true } } } },
                quotes: { include: { items: true } }
            }
        });
        if (!rfq) {
            res.status(404).json({ success: false, message: 'RFQ not found' });
            return;
        }
        res.json({ success: true, data: rfq });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch RFQ', error: error.message });
    }
};
exports.getRfqDetails = getRfqDetails;
const getRfqMessages = async (req, res) => {
    try {
        const rfqId = parseInt(req.params.id, 10);
        const messages = await prisma_1.default.rfqMessage.findMany({
            where: { rfqId },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ success: true, data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
    }
};
exports.getRfqMessages = getRfqMessages;
//# sourceMappingURL=rfq.controller.js.map