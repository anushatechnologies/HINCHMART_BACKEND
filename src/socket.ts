import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import prisma from './utils/prisma';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
        : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join RFQ Room
    socket.on('join_rfq_room', (rfqId: string) => {
      socket.join(`rfq_${rfqId}`);
      console.log(`Socket ${socket.id} joined room rfq_${rfqId}`);
    });

    // Join User Room
    socket.on('join_user_room', (userId: number | string) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    // Join Vendor Room
    socket.on('join_vendor_room', (vendorId: number | string) => {
      socket.join(`vendor_${vendorId}`);
      console.log(`Socket ${socket.id} joined room vendor_${vendorId}`);
    });

    // Send Message
    socket.on('send_message', async (data: { rfqId: number, senderId: number, senderRole: string, message: string }) => {
      try {
        const { rfqId, senderId, senderRole, message } = data;
        
        // Save to database
        const savedMessage = await prisma.rfqMessage.create({
          data: {
            rfqId: Number(rfqId),
            senderId: Number(senderId),
            senderRole,
            message
          }
        });

        // Broadcast to everyone in the room
        io.to(`rfq_${rfqId}`).emit('receive_message', savedMessage);
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) {
    return null;
  }
  return io;
};

export const emitNotificationToUser = (userId: number, notification: any) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

export const emitOrderStatusChange = (orderId: number, status: string, userId?: number) => {
  if (io) {
    if (userId) {
      io.to(`user_${userId}`).emit('order_status_updated', { orderId, status });
    }
    io.emit('order_updated', { orderId, status });
  }
};

export const emitRfqQuoteUpdate = (rfqId: number, quote: any) => {
  if (io) {
    io.to(`rfq_${rfqId}`).emit('rfq_quote_updated', quote);
  }
};

