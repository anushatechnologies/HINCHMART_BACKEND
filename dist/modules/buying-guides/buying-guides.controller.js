"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBuyingGuide = exports.updateBuyingGuide = exports.createBuyingGuide = exports.getAllGuidesAdmin = exports.getBuyingGuideBySlug = exports.getBuyingGuides = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Public: List published guides ────────────────────────────────────────────
const getBuyingGuides = async (req, res) => {
    try {
        const { category, page = '1', limit = '12' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = { published: true };
        if (category)
            where.category = category;
        const [guides, total] = await Promise.all([
            prisma_1.default.buyingGuide.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
                select: { id: true, title: true, slug: true, summary: true, imageUrl: true, category: true, createdAt: true }
            }),
            prisma_1.default.buyingGuide.count({ where })
        ]);
        return res.json({ success: true, data: guides, total });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getBuyingGuides = getBuyingGuides;
// ─── Public: Single guide by slug ─────────────────────────────────────────────
const getBuyingGuideBySlug = async (req, res) => {
    try {
        const guide = await prisma_1.default.buyingGuide.findUnique({ where: { slug: req.params.slug } });
        if (!guide || !guide.published)
            return res.status(404).json({ success: false, message: 'Guide not found' });
        return res.json({ success: true, data: guide });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getBuyingGuideBySlug = getBuyingGuideBySlug;
// ─── Admin: List all guides ────────────────────────────────────────────────────
const getAllGuidesAdmin = async (req, res) => {
    try {
        const guides = await prisma_1.default.buyingGuide.findMany({ orderBy: { createdAt: 'desc' } });
        return res.json({ success: true, data: guides });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllGuidesAdmin = getAllGuidesAdmin;
// ─── Admin: Create guide ───────────────────────────────────────────────────────
const createBuyingGuide = async (req, res) => {
    try {
        const { title, slug, summary, content, imageUrl, category, published } = req.body;
        if (!title || !slug || !content) {
            return res.status(400).json({ success: false, message: 'title, slug and content are required' });
        }
        const guide = await prisma_1.default.buyingGuide.create({
            data: { title, slug, summary: summary || '', content, imageUrl, category, published: published !== false }
        });
        return res.status(201).json({ success: true, data: guide });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.createBuyingGuide = createBuyingGuide;
// ─── Admin: Update guide ───────────────────────────────────────────────────────
const updateBuyingGuide = async (req, res) => {
    try {
        const guide = await prisma_1.default.buyingGuide.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        return res.json({ success: true, data: guide });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateBuyingGuide = updateBuyingGuide;
// ─── Admin: Delete guide ───────────────────────────────────────────────────────
const deleteBuyingGuide = async (req, res) => {
    try {
        await prisma_1.default.buyingGuide.delete({ where: { id: parseInt(req.params.id) } });
        return res.json({ success: true, message: 'Guide deleted' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteBuyingGuide = deleteBuyingGuide;
//# sourceMappingURL=buying-guides.controller.js.map