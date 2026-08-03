"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBySku = exports.getPopularSearches = exports.searchProducts = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// GET /api/search?q=drill&type=all
const searchProducts = async (req, res) => {
    try {
        const { q, type = 'all', limit = '8' } = req.query;
        const query = q?.trim();
        if (!query || query.length < 2) {
            return res.json({ success: true, data: { products: [], brands: [], categories: [] } });
        }
        const take = parseInt(limit);
        const [products, brands, categories] = await Promise.all([
            // Product search (name, brand, SKU, barcode, model number)
            prisma_1.default.product.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query } },
                        { brand: { contains: query } },
                        { modelNumber: { contains: query } },
                        { barcode: { contains: query } },
                        { hsnCode: { contains: query } },
                    ]
                },
                include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
                take,
                orderBy: { name: 'asc' }
            }),
            // Brand search
            prisma_1.default.product.findMany({
                where: { isActive: true, brand: { contains: query } },
                select: { brand: true },
                distinct: ['brand'],
                take: 5,
            }),
            // Category search
            prisma_1.default.category.findMany({
                where: {
                    isActive: true,
                    name: { contains: query },
                    parentId: null, // top-level only
                },
                include: { children: { take: 5 } },
                take: 5,
            }),
        ]);
        // Deduplicate brands
        const uniqueBrands = [...new Set(brands.map((p) => p.brand).filter(Boolean))];
        res.json({
            success: true,
            data: { products, brands: uniqueBrands, categories }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.searchProducts = searchProducts;
// GET /api/search/popular — returns popular search terms based on top products
const getPopularSearches = async (req, res) => {
    try {
        // Get top categories and brands as popular search terms
        const topCategories = await prisma_1.default.category.findMany({
            where: { isActive: true, parentId: null },
            take: 6,
            orderBy: { id: 'asc' }
        });
        const topBrands = await prisma_1.default.product.findMany({
            where: { isActive: true, brand: { not: null } },
            select: { brand: true },
            distinct: ['brand'],
            take: 6,
        });
        const popular = [
            ...topCategories.map((c) => ({ label: c.name, type: 'category', slug: c.slug })),
            ...topBrands.map((p) => ({ label: p.brand, type: 'brand' })),
        ];
        res.json({ success: true, data: popular });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPopularSearches = getPopularSearches;
// GET /api/search/sku?sku=ABC123
const searchBySku = async (req, res) => {
    try {
        const { sku } = req.query;
        if (!sku)
            return res.json({ success: true, data: null });
        const variant = await prisma_1.default.productVariant.findFirst({
            where: { sku: { contains: sku } },
            include: {
                product: {
                    include: { images: { where: { isPrimary: true }, take: 1 }, category: true }
                }
            }
        });
        res.json({ success: true, data: variant?.product || null });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.searchBySku = searchBySku;
//# sourceMappingURL=search.controller.js.map