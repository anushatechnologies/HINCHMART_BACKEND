"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.sendPushToUser = exports.sendPushToVendor = exports.sendMulticastPush = void 0;
const messaging_1 = require("firebase-admin/messaging");
const prisma_1 = __importDefault(require("./prisma"));
/**
 * Send a push notification using Firebase Cloud Messaging (FCM)
 * @param tokens Array of FCM device tokens
 * @param title Notification Title
 * @param body Notification Body
 * @param data Optional data payload
 */
const sendMulticastPush = async (tokens, title, body, data) => {
    if (!tokens || tokens.length === 0) {
        console.log('[FCM] No tokens provided, skipping push notification');
        return;
    }
    const message = {
        notification: { title, body },
        data: data || {},
        tokens: tokens
    };
    try {
        const response = await (0, messaging_1.getMessaging)().sendEachForMulticast(message);
        console.log(`[FCM] Successfully sent message. Success count: ${response.successCount}, Failure count: ${response.failureCount}`);
    }
    catch (error) {
        console.error('[FCM] Error sending multicast push notification:', error);
    }
};
exports.sendMulticastPush = sendMulticastPush;
/**
 * Helper to easily send a push notification to a specific Vendor
 */
const sendPushToVendor = async (vendorId, title, body, data) => {
    try {
        const vendor = await prisma_1.default.vendor.findUnique({
            where: { id: vendorId },
            select: { fcmTokens: true }
        });
        if (!vendor || !vendor.fcmTokens)
            return;
        // Prisma JSON fields are typed as Prisma.JsonValue, so we safely parse it
        let tokens = [];
        if (typeof vendor.fcmTokens === 'string') {
            tokens = JSON.parse(vendor.fcmTokens);
        }
        else if (Array.isArray(vendor.fcmTokens)) {
            tokens = vendor.fcmTokens;
        }
        if (tokens.length > 0) {
            await (0, exports.sendMulticastPush)(tokens, title, body, data);
        }
    }
    catch (error) {
        console.error(`[FCM] Error fetching vendor ${vendorId} tokens:`, error);
    }
};
exports.sendPushToVendor = sendPushToVendor;
/**
 * Helper to easily send a push notification to a specific User (Customer)
 */
const sendPushToUser = async (userId, title, body, data) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true }
        });
        if (!user || !user.fcmTokens)
            return;
        let tokens = [];
        if (typeof user.fcmTokens === 'string') {
            tokens = JSON.parse(user.fcmTokens);
        }
        else if (Array.isArray(user.fcmTokens)) {
            tokens = user.fcmTokens;
        }
        if (tokens.length > 0) {
            await (0, exports.sendMulticastPush)(tokens, title, body, data);
        }
    }
    catch (error) {
        console.error(`[FCM] Error fetching user ${userId} tokens:`, error);
    }
};
exports.sendPushToUser = sendPushToUser;
/**
 * Service to handle Email and SMS notifications for orders/shipping.
 * Uses AWS SES for email. SMS via Firebase is handled client-side primarily,
 * but backend logging is included here.
 */
class NotificationService {
    static async sendOrderConfirmation(email, phone, orderNumber, totalAmount, trackingUrl) {
        console.log(`[Notification] Order Confirmation for ${orderNumber} to ${email}`);
        // Implementation for SES send email can be added here
    }
    static async sendShippingUpdate(email, phone, orderNumber, status) {
        console.log(`[Notification] Shipping Update for ${orderNumber}: ${status} to ${email}`);
        // Implementation for SES send email can be added here
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notifications.js.map