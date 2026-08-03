"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await prisma_1.default.cart.findUnique({
            where: { userId },
            include: {
                user: { include: { company: true } },
                items: {
                    include: {
                        variant: {
                            include: { product: { include: { images: true } }, images: true }
                        }
                    }
                }
            }
        });
        if (cart && cart.user?.companyId) {
            const contracts = await prisma_1.default.companyContract.findMany({
                where: { companyId: cart.user.companyId, isActive: true }
            });
            if (contracts.length > 0) {
                cart.items = cart.items.map((item) => {
                    const contract = contracts.find(c => c.productId === item.variant.productId);
                    if (contract) {
                        item.variant.price = contract.customPrice;
                        item.variant.product.basePrice = contract.customPrice;
                        item.isContractPrice = true;
                    }
                    return item;
                });
            }
        }
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCart = getCart;
const addItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { variantId, productId, quantity } = req.body;
        const reqQty = parseInt(quantity) || 1;
        let targetVariantId = variantId ? parseInt(variantId) : null;
        // If no variantId is provided, look for the first variant of the product
        if (!targetVariantId && productId) {
            const firstVariant = await prisma_1.default.productVariant.findFirst({
                where: { productId: parseInt(productId) }
            });
            if (!firstVariant) {
                return res.status(400).json({ success: false, message: 'This product has no active variants' });
            }
            targetVariantId = firstVariant.id;
        }
        if (!targetVariantId) {
            return res.status(400).json({ success: false, message: 'variantId or productId is required' });
        }
        // Retrieve product & variant details to run MOQ/stock validation
        const variant = await prisma_1.default.productVariant.findUnique({
            where: { id: targetVariantId },
            include: { product: true }
        });
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Product variant not found' });
        }
        const product = variant.product;
        // 1. Stock Status Validation
        if (product.stockStatus === 'OUT_OF_STOCK') {
            return res.status(400).json({ success: false, message: 'This item is currently out of stock' });
        }
        // 2. Minimum Order Quantity (MOQ) Validation
        if (reqQty < product.moq) {
            return res.status(400).json({
                success: false,
                message: `Minimum order quantity for this item is ${product.moq} units`
            });
        }
        // 3. Variant Stock Quantity Validation
        if (variant.stockQty < reqQty) {
            return res.status(400).json({
                success: false,
                message: `Only ${variant.stockQty} units available in stock`
            });
        }
        let cart = await prisma_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma_1.default.cart.create({ data: { userId } });
        }
        const existingItem = await prisma_1.default.cartItem.findFirst({
            where: { cartId: cart.id, variantId: targetVariantId }
        });
        const newQty = existingItem ? existingItem.quantity + reqQty : reqQty;
        // Re-verify combined stock limits
        if (variant.stockQty < newQty) {
            return res.status(400).json({
                success: false,
                message: `Cannot add more units. Total quantity in cart would exceed available stock of ${variant.stockQty} units.`
            });
        }
        if (existingItem) {
            await prisma_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQty }
            });
        }
        else {
            await prisma_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId: targetVariantId,
                    quantity: newQty
                }
            });
        }
        res.json({ success: true, message: 'Item added to cart successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addItem = addItem;
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const reqQty = parseInt(quantity);
        if (isNaN(reqQty) || reqQty < 1) {
            return res.status(400).json({ success: false, message: 'Invalid quantity' });
        }
        const cartItem = await prisma_1.default.cartItem.findUnique({
            where: { id: parseInt(id) },
            include: {
                variant: { include: { product: true } }
            }
        });
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        const variant = cartItem.variant;
        const product = variant.product;
        // 1. MOQ Validation
        if (reqQty < product.moq) {
            return res.status(400).json({
                success: false,
                message: `Minimum order quantity for this item is ${product.moq} units`
            });
        }
        // 2. Stock limits
        if (variant.stockQty < reqQty) {
            return res.status(400).json({
                success: false,
                message: `Only ${variant.stockQty} units available in stock`
            });
        }
        await prisma_1.default.cartItem.update({
            where: { id: parseInt(id) },
            data: { quantity: reqQty }
        });
        res.json({ success: true, message: 'Cart updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateItem = updateItem;
const removeItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.cartItem.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Item removed from cart' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.removeItem = removeItem;
const syncCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body; // array of guest cart items
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Invalid items array' });
        }
        let cart = await prisma_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma_1.default.cart.create({ data: { userId } });
        }
        for (const item of items) {
            if (!item.variant || !item.variant.id)
                continue;
            const variantId = item.variant.id;
            const quantity = item.quantity || 1;
            const existingItem = await prisma_1.default.cartItem.findFirst({
                where: { cartId: cart.id, variantId: parseInt(variantId) }
            });
            if (existingItem) {
                await prisma_1.default.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + quantity }
                });
            }
            else {
                await prisma_1.default.cartItem.create({
                    data: {
                        cartId: cart.id,
                        variantId: parseInt(variantId),
                        quantity
                    }
                });
            }
        }
        res.json({ success: true, message: 'Cart synced successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.syncCart = syncCart;
//# sourceMappingURL=cart.controller.js.map