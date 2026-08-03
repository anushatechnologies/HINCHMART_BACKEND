"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getCategories = async (req, res) => {
    try {
        // Only fetch root categories, include their children
        const categories = await prisma_1.default.category.findMany({
            where: {
                isActive: true,
                parentId: null
            },
            include: { children: true },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, slug, parentId } = req.body;
        const imageUrl = req.file ? req.file.path : null;
        const category = await prisma_1.default.category.create({
            data: {
                name,
                slug,
                parentId: parentId ? parseInt(parentId) : null,
                imageUrl,
            },
        });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, slug, isActive } = req.body;
        let updateData = {};
        if (name)
            updateData.name = name;
        if (slug)
            updateData.slug = slug;
        if (isActive !== undefined)
            updateData.isActive = typeof isActive === 'string' ? isActive === 'true' : isActive;
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }
        const category = await prisma_1.default.category.update({
            where: { id },
            data: updateData
        });
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await prisma_1.default.category.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categories.controller.js.map