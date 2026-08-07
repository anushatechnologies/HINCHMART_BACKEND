"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestBrandApproval = exports.getVendorBrands = exports.requestCategoryApproval = exports.getVendorCategories = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Categories ───────────────────────────────────────────────────────────────
const getVendorCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null, isActive: true },
            include: {
                children: {
                    where: { isActive: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVendorCategories = getVendorCategories;
const requestCategoryApproval = async (req, res) => {
    try {
        const { name, icon, description } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Category name is required' });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description: description || null,
                isActive: false // Pending approval
            }
        });
        res.status(201).json({ success: true, data: category, message: 'Category request submitted for approval' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestCategoryApproval = requestCategoryApproval;
// ─── Brands ───────────────────────────────────────────────────────────────────
const getVendorBrands = async (req, res) => {
    try {
        const brands = await prisma.brand.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: brands });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVendorBrands = getVendorBrands;
const requestBrandApproval = async (req, res) => {
    try {
        const { name, logoUrl } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Brand name is required' });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                logoUrl: logoUrl || null,
                status: 'PENDING'
            }
        });
        res.status(201).json({ success: true, data: brand, message: 'Brand request submitted for approval' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestBrandApproval = requestBrandApproval;
//# sourceMappingURL=vendor-categories.controller.js.map