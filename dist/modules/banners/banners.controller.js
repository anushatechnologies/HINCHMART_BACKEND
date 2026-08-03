"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getBanners = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getBanners = async (req, res) => {
    try {
        const banners = await prisma_1.default.banner.findMany({
            orderBy: { sortOrder: 'asc' }
        });
        res.json({ success: true, data: banners });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBanners = getBanners;
const createBanner = async (req, res) => {
    try {
        const { title, linkUrl, position, sortOrder, isActive } = req.body;
        const imageUrl = req.file ? req.file.path : req.body.imageUrl;
        if (!imageUrl) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }
        const banner = await prisma_1.default.banner.create({
            data: {
                title,
                imageUrl,
                linkUrl,
                position: position || 'HERO',
                sortOrder: parseInt(sortOrder) || 0,
                isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
            }
        });
        res.status(201).json({ success: true, data: banner });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createBanner = createBanner;
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }
        if (updateData.sortOrder)
            updateData.sortOrder = parseInt(updateData.sortOrder);
        if (updateData.isActive !== undefined)
            updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
        const banner = await prisma_1.default.banner.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json({ success: true, data: banner });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBanner = updateBanner;
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.banner.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Banner deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteBanner = deleteBanner;
//# sourceMappingURL=banners.controller.js.map