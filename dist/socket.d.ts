import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
export declare const initSocket: (server: HttpServer) => void;
export declare const getIO: () => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any> | null;
export declare const emitNotificationToUser: (userId: number, notification: any) => void;
export declare const emitOrderStatusChange: (orderId: number, status: string, userId?: number) => void;
export declare const emitRfqQuoteUpdate: (rfqId: number, quote: any) => void;
//# sourceMappingURL=socket.d.ts.map