"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await prisma_1.default.wishlistItem.findMany({
            where: { userId },
            include: {
                product: { include: { images: true } }
            }
        });
        res.json({ success: true, data: wishlist });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWishlist = getWishlist;
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        const exists = await prisma_1.default.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId: parseInt(productId) } }
        });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Already in wishlist' });
        }
        const item = await prisma_1.default.wishlistItem.create({
            data: { userId, productId: parseInt(productId) }
        });
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        await prisma_1.default.wishlistItem.delete({
            where: { userId_productId: { userId, productId: parseInt(productId) } }
        });
        res.json({ success: true, message: 'Removed from wishlist' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.removeFromWishlist = removeFromWishlist;
const syncWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body; // Array of product IDs
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Invalid items array' });
        }
        for (const productId of items) {
            if (!productId)
                continue;
            const exists = await prisma_1.default.wishlistItem.findUnique({
                where: { userId_productId: { userId, productId: parseInt(productId) } }
            });
            if (!exists) {
                await prisma_1.default.wishlistItem.create({
                    data: { userId, productId: parseInt(productId) }
                });
            }
        }
        res.json({ success: true, message: 'Wishlist synced successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.syncWishlist = syncWishlist;
//# sourceMappingURL=wishlist.controller.js.map