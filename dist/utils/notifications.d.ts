/**
 * Send a push notification using Firebase Cloud Messaging (FCM)
 * @param tokens Array of FCM device tokens
 * @param title Notification Title
 * @param body Notification Body
 * @param data Optional data payload
 */
export declare const sendMulticastPush: (tokens: string[], title: string, body: string, data?: Record<string, string>) => Promise<void>;
/**
 * Helper to easily send a push notification to a specific Vendor
 */
export declare const sendPushToVendor: (vendorId: number, title: string, body: string, data?: Record<string, string>) => Promise<void>;
/**
 * Helper to easily send a push notification to a specific User (Customer)
 */
export declare const sendPushToUser: (userId: number, title: string, body: string, data?: Record<string, string>) => Promise<void>;
/**
 * Service to handle Email and SMS notifications for orders/shipping.
 * Uses AWS SES for email. SMS via Firebase is handled client-side primarily,
 * but backend logging is included here.
 */
export declare class NotificationService {
    static sendOrderConfirmation(email: string, phone: string, orderNumber: string, totalAmount: number, trackingUrl?: string): Promise<void>;
    static sendShippingUpdate(email: string, phone: string, orderNumber: string, status: string): Promise<void>;
}
//# sourceMappingURL=notifications.d.ts.map