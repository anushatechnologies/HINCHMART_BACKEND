"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationSettings = exports.getNotificationSettings = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// GET /api/notifications — get my notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma_1.default.customerNotification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = await prisma_1.default.customerNotification.count({ where: { userId, isRead: false } });
        return res.json({ success: true, data: notifications, unreadCount });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getNotifications = getNotifications;
// PATCH /api/notifications/:id/read — mark single as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma_1.default.customerNotification.updateMany({
            where: { id: parseInt(req.params.id), userId },
            data: { isRead: true },
        });
        return res.json({ success: true, message: 'Marked as read' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.markAsRead = markAsRead;
// PATCH /api/notifications/mark-all-read — mark all as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma_1.default.customerNotification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.markAllAsRead = markAllAsRead;
// GET /api/notifications/settings — get preferences
const getNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        let settings = await prisma_1.default.customerNotificationSetting.findUnique({ where: { userId } });
        if (!settings) {
            settings = await prisma_1.default.customerNotificationSetting.create({
                data: { userId },
            });
        }
        return res.json({ success: true, data: settings });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getNotificationSettings = getNotificationSettings;
// PUT /api/notifications/settings — update preferences
const updateNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { emailAlerts, smsAlerts, pushAlerts, promoEmails } = req.body;
        const settings = await prisma_1.default.customerNotificationSetting.upsert({
            where: { userId },
            create: { userId, emailAlerts, smsAlerts, pushAlerts, promoEmails },
            update: { emailAlerts, smsAlerts, pushAlerts, promoEmails },
        });
        return res.json({ success: true, data: settings, message: 'Preferences saved!' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateNotificationSettings = updateNotificationSettings;
//# sourceMappingURL=notifications.controller.js.map