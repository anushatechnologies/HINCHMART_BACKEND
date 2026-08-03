"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilters = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// GET /api/filters?category=construction
// Returns all available filter options dynamically based on current product data
const getFilters = async (req, res) => {
    try {
        const { category } = req.query;
        const where = { isActive: true };
        if (category) {
            where.category = { slug: category };
        }
        const [brands, priceRange, countries, stockStatuses, attributes] = await Promise.all([
            // Distinct brands
            prisma_1.default.product.findMany({
                where: { ...where, brand: { not: null } },
                select: { brand: true },
                distinct: ['brand'],
                orderBy: { brand: 'asc' },
            }),
            // Price min/max
            prisma_1.default.product.aggregate({
                where,
                _min: { basePrice: true },
                _max: { basePrice: true },
            }),
            // Distinct countries of origin
            prisma_1.default.product.findMany({
                where: { ...where, countryOfOrigin: { not: null } },
                select: { countryOfOrigin: true },
                distinct: ['countryOfOrigin'],
            }),
            // Stock statuses in use
            prisma_1.default.product.findMany({
                where,
                select: { stockStatus: true },
                distinct: ['stockStatus'],
            }),
            // Category-specific attributes (for dynamic filters like size, voltage, etc.)
            category
                ? prisma_1.default.attribute.findMany({
                    where: { category: { slug: category } },
                    include: { values: true },
                })
                : Promise.resolve([]),
        ]);
        res.json({
            success: true,
            data: {
                brands: brands.map((b) => b.brand).filter(Boolean),
                priceRange: {
                    min: Number(priceRange._min.basePrice) || 0,
                    max: Number(priceRange._max.basePrice) || 100000,
                },
                countries: countries.map((c) => c.countryOfOrigin).filter(Boolean),
                stockStatuses: stockStatuses.map((s) => s.stockStatus),
                attributes,
                // Static filter groups that apply to all products
                ratings: [4, 3, 2, 1],
                discountBrackets: ['10', '20', '30', '50', '70'],
                deliveryOptions: ['Same Day', 'Next Day', 'Within 3 Days', 'Within 7 Days'],
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getFilters = getFilters;
//# sourceMappingURL=filters.controller.js.map