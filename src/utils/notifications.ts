import { getMessaging } from 'firebase-admin/messaging';
import prisma from './prisma';

/**
 * Send a push notification using Firebase Cloud Messaging (FCM)
 * @param tokens Array of FCM device tokens
 * @param title Notification Title
 * @param body Notification Body
 * @param data Optional data payload
 */
export const sendMulticastPush = async (tokens: string[], title: string, body: string, data?: Record<string, string>) => {
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
    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`[FCM] Successfully sent message. Success count: ${response.successCount}, Failure count: ${response.failureCount}`);
  } catch (error) {
    console.error('[FCM] Error sending multicast push notification:', error);
  }
};

/**
 * Helper to easily send a push notification to a specific Vendor
 */
export const sendPushToVendor = async (vendorId: number, title: string, body: string, data?: Record<string, string>) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { fcmTokens: true }
    });

    if (!vendor || !vendor.fcmTokens) return;

    // Prisma JSON fields are typed as Prisma.JsonValue, so we safely parse it
    let tokens: string[] = [];
    if (typeof vendor.fcmTokens === 'string') {
      tokens = JSON.parse(vendor.fcmTokens);
    } else if (Array.isArray(vendor.fcmTokens)) {
      tokens = vendor.fcmTokens as string[];
    }

    if (tokens.length > 0) {
      await sendMulticastPush(tokens, title, body, data);
    }
  } catch (error) {
    console.error(`[FCM] Error fetching vendor ${vendorId} tokens:`, error);
  }
};

/**
 * Helper to easily send a push notification to a specific User (Customer)
 */
export const sendPushToUser = async (userId: number, title: string, body: string, data?: Record<string, string>) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true }
    });

    if (!user || !user.fcmTokens) return;

    let tokens: string[] = [];
    if (typeof user.fcmTokens === 'string') {
      tokens = JSON.parse(user.fcmTokens);
    } else if (Array.isArray(user.fcmTokens)) {
      tokens = user.fcmTokens as string[];
    }

    if (tokens.length > 0) {
      await sendMulticastPush(tokens, title, body, data);
    }
  } catch (error) {
    console.error(`[FCM] Error fetching user ${userId} tokens:`, error);
  }
};

/**
 * Service to handle Email and SMS notifications for orders/shipping.
 * Uses AWS SES for email. SMS via Firebase is handled client-side primarily, 
 * but backend logging is included here.
 */
export class NotificationService {
  static async sendOrderConfirmation(email: string, phone: string, orderNumber: string, totalAmount: number, trackingUrl?: string) {
    console.log(`[Notification] Order Confirmation for ${orderNumber} to ${email}`);
    // Implementation for SES send email can be added here
  }

  static async sendShippingUpdate(email: string, phone: string, orderNumber: string, status: string) {
    console.log(`[Notification] Shipping Update for ${orderNumber}: ${status} to ${email}`);
    // Implementation for SES send email can be added here
  }
}
