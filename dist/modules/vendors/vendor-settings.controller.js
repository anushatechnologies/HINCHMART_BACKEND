"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWebhook = exports.createWebhook = exports.deleteApiKey = exports.createApiKey = exports.updateSettings = exports.getSettings = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
// --- General Settings ---
const getSettings = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: {
                apiKeys: { select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true } },
                webhooks: true
            }
        });
        if (!vendor) {
            res.status(404).json({ success: false, message: 'Vendor not found' });
            return;
        }
        res.status(200).json({ success: true, data: vendor });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const vendorId = parseInt(req.body.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        // Extract settings from body (excluding restricted fields)
        const { businessName, email, phone, address, shippingFee, freeShippingThreshold, gstNumber, razorpayAccountId, twoFactorEnabled } = req.body;
        const vendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: {
                businessName, email, phone, address,
                shippingFee: shippingFee ? parseFloat(shippingFee) : null,
                freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
                gstNumber, razorpayAccountId,
                twoFactorEnabled: twoFactorEnabled === true
            }
        });
        res.status(200).json({ success: true, message: 'Settings updated successfully', data: vendor });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateSettings = updateSettings;
// --- API Keys ---
const createApiKey = async (req, res) => {
    try {
        const { vendorId, name } = req.body;
        if (!vendorId || !name) {
            res.status(400).json({ success: false, message: 'vendorId and name are required' });
            return;
        }
        // Generate a secure random key
        const rawKey = crypto_1.default.randomBytes(32).toString('hex');
        const secretKey = `sk_live_${rawKey}`;
        const keyPrefix = secretKey.substring(0, 12) + '...';
        // Hash it for DB storage
        const secretHash = crypto_1.default.createHash('sha256').update(secretKey).digest('hex');
        const apiKey = await prisma.vendorApiKey.create({
            data: {
                vendorId: parseInt(vendorId, 10),
                name,
                keyPrefix,
                secretHash
            }
        });
        // ONLY return the raw secretKey once!
        res.status(201).json({ success: true, message: 'API Key generated', data: { ...apiKey, secretKey } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createApiKey = createApiKey;
const deleteApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.vendorApiKey.delete({ where: { id: parseInt(id, 10) } });
        res.status(200).json({ success: true, message: 'API Key revoked' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteApiKey = deleteApiKey;
// --- Webhooks ---
const createWebhook = async (req, res) => {
    try {
        const { vendorId, url, events } = req.body;
        if (!vendorId || !url || !events) {
            res.status(400).json({ success: false, message: 'vendorId, url, and events are required' });
            return;
        }
        const secret = `whsec_${crypto_1.default.randomBytes(24).toString('hex')}`;
        const webhook = await prisma.vendorWebhook.create({
            data: {
                vendorId: parseInt(vendorId, 10),
                url,
                events,
                secret
            }
        });
        res.status(201).json({ success: true, message: 'Webhook registered', data: webhook });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createWebhook = createWebhook;
const deleteWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.vendorWebhook.delete({ where: { id: parseInt(id, 10) } });
        res.status(200).json({ success: true, message: 'Webhook deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteWebhook = deleteWebhook;
//# sourceMappingURL=vendor-settings.controller.js.map