"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorInventory = exports.createVendorProduct = exports.getVendorProductById = exports.getVendorProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getVendorProducts = async (req, res) => {
    try {
        // Priority: JWT token vendorId (authenticated seller) > query param vendorId (admin viewing)
        const tokenVendorId = req.user?.vendorId || req.user?.id;
        const queryVendorId = req.query.vendorId ? parseInt(req.query.vendorId, 10) : null;
        const vendorId = tokenVendorId || queryVendorId;
        const status = req.query.status;
        // STRICT filter: only return products belonging to this vendor
        // If no vendorId, return empty (never leak other vendors' products)
        if (!vendorId || isNaN(vendorId)) {
            res.status(200).json({ success: true, data: [], message: 'No vendor context found' });
            return;
        }
        let whereClause = { vendorId };
        if (status === 'DELETED') {
            whereClause.deletedAt = { not: null };
        }
        else {
            whereClause.deletedAt = null;
            if (status === 'PENDING') {
                whereClause.approvalStatus = 'PENDING';
            }
            else if (status === 'ACTIVE') {
                whereClause.approvalStatus = 'APPROVED';
            }
        }
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                category: true,
                variants: true,
                images: { where: { isPrimary: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: products, vendorId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
    }
};
exports.getVendorProducts = getVendorProducts;
const getVendorProductById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                variants: true,
                images: true,
                videos: true,
                documents: true
            }
        });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch product', error: error.message });
    }
};
exports.getVendorProductById = getVendorProductById;
const createVendorProduct = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { name, brand, categoryId, basePrice, mrp, sku, description, isRentable, rentPricePerDay, isSameDayDelivery } = req.body;
        if (!name || !categoryId || !basePrice) {
            res.status(400).json({ success: false, message: 'Name, Category, and Price are required' });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
        const product = await prisma.product.create({
            data: {
                name,
                slug,
                brand: brand || 'Generic',
                categoryId: parseInt(categoryId, 10),
                vendorId: vendorId ? parseInt(vendorId, 10) : 1,
                basePrice: parseFloat(basePrice),
                mrp: mrp ? parseFloat(mrp) : parseFloat(basePrice) * 1.2,
                gstPercent: 18.00,
                modelNumber: sku || `SKU-${Date.now()}`,
                description: description || '',
                approvalStatus: 'APPROVED',
                isActive: true,
                isRentable: Boolean(isRentable),
                rentPricePerDay: rentPricePerDay ? parseFloat(rentPricePerDay) : null,
                isSameDayDelivery: Boolean(isSameDayDelivery)
            }
        });
        res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};
exports.createVendorProduct = createVendorProduct;
const updateVendorInventory = async (req, res) => {
    try {
        const { productId, variantId, quantity } = req.body;
        const qty = parseInt(quantity, 10) || 0;
        if (variantId) {
            await prisma.productVariant.update({
                where: { id: parseInt(variantId, 10) },
                data: { stockQty: qty }
            });
        }
        if (productId) {
            const stockStatus = qty === 0 ? 'OUT_OF_STOCK' : qty < 10 ? 'LOW_STOCK' : 'IN_STOCK';
            await prisma.product.update({
                where: { id: parseInt(productId, 10) },
                data: {
                    stockStatus
                }
            });
        }
        res.status(200).json({ success: true, message: 'Stock inventory updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update inventory', error: error.message });
    }
};
exports.updateVendorInventory = updateVendorInventory;
//# sourceMappingURL=vendor-products.controller.js.map