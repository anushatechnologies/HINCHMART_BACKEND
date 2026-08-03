"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationSettings = exports.getNotificationSettings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getNotificationSettings = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        let settings = await prisma.vendorNotificationSetting.findUnique({
            where: { vendorId }
        });
        if (!settings) {
            settings = await prisma.vendorNotificationSetting.create({
                data: {
                    vendorId,
                    emailEvents: { newOrder: true, lowStock: true, customerMessage: true, returnRequest: true },
                    smsEvents: { newOrder: false, urgentTicket: true },
                    pushEvents: { newOrder: true, customerMessage: true },
                    whatsappEvents: { newOrder: false, shippingUpdate: true }
                }
            });
        }
        res.status(200).json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getNotificationSettings = getNotificationSettings;
const updateNotificationSettings = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        // Prepare data by omitting vendorId and id from the body
        const { id, vendorId: vId, ...updateData } = req.body;
        const settings = await prisma.vendorNotificationSetting.update({
            where: { vendorId },
            data: updateData
        });
        res.status(200).json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateNotificationSettings = updateNotificationSettings;
//# sourceMappingURL=vendor-notifications.controller.js.map