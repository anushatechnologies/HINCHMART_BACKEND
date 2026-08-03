"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const prisma_1 = __importDefault(require("./utils/prisma"));
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Allow all origins for MVP
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // Join RFQ Room
        socket.on('join_rfq_room', (rfqId) => {
            socket.join(`rfq_${rfqId}`);
            console.log(`Socket ${socket.id} joined room rfq_${rfqId}`);
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
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map