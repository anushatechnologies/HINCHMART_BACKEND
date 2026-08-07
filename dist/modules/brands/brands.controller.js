"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveBrands = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Get all active global brands (For Option A typeahead)
 * GET /api/brands
 */
const getActiveBrands = async (req, res) => {
    try {
        const brands = await prisma.brand.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                country: true
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: brands });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getActiveBrands = getActiveBrands;
//# sourceMappingURL=brands.controller.js.map