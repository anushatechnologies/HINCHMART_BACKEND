"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitRfqQuoteUpdate = exports.emitOrderStatusChange = exports.emitNotificationToUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const prisma_1 = __importDefault(require("./utils/prisma"));
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
                : '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // Join RFQ Room
        socket.on('join_rfq_room', (rfqId) => {
            socket.join(`rfq_${rfqId}`);
            console.log(`Socket ${socket.id} joined room rfq_${rfqId}`);
        });
        // Join User Room
        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined room user_${userId}`);
        });
        // Join Vendor Room
        socket.on('join_vendor_room', (vendorId) => {
            socket.join(`vendor_${vendorId}`);
            console.log(`Socket ${socket.id} joined room vendor_${vendorId}`);
        });
        // Send Message
        socket.on('send_message', async (data) => {
            try {
                const { rfqId, senderId, senderRole, message } = data;
                // Save to database
                const savedMessage = await prisma_1.default.rfqMessage.create({
                    data: {
                        rfqId: Number(rfqId),
                        senderId: Number(senderId),
                        senderRole,
                        message
                    }
                });
                // Broadcast to everyone in the room
                io.to(`rfq_${rfqId}`).emit('receive_message', savedMessage);
            }
            catch (error) {
                console.error('Socket message error:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        return null;
    }
    return io;
};
exports.getIO = getIO;
const emitNotificationToUser = (userId, notification) => {
    if (io) {
        io.to(`user_${userId}`).emit('notification', notification);
    }
};
exports.emitNotificationToUser = emitNotificationToUser;
const emitOrderStatusChange = (orderId, status, userId) => {
    if (io) {
        if (userId) {
            io.to(`user_${userId}`).emit('order_status_updated', { orderId, status });
        }
        io.emit('order_updated', { orderId, status });
    }
};
exports.emitOrderStatusChange = emitOrderStatusChange;
const emitRfqQuoteUpdate = (rfqId, quote) => {
    if (io) {
        io.to(`rfq_${rfqId}`).emit('rfq_quote_updated', quote);
    }
};
exports.emitRfqQuoteUpdate = emitRfqQuoteUpdate;
//# sourceMappingURL=socket.js.map