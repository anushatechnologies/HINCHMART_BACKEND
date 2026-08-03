"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getAllBlogsAdmin = exports.getBlogBySlug = exports.getBlogs = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Public: List all published blogs ─────────────────────────────────────────
const getBlogs = async (req, res) => {
    try {
        const { page = '1', limit = '12', search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = { published: true };
        if (search)
            where.title = { contains: search };
        const [blogs, total] = await Promise.all([
            prisma_1.default.blog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
                select: { id: true, title: true, slug: true, summary: true, imageUrl: true, createdAt: true }
            }),
            prisma_1.default.blog.count({ where })
        ]);
        return res.json({ success: true, data: blogs, total, page: parseInt(page) });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getBlogs = getBlogs;
// ─── Public: Single blog by slug ───────────────────────────────────────────────
const getBlogBySlug = async (req, res) => {
    try {
        const blog = await prisma_1.default.blog.findUnique({ where: { slug: req.params.slug } });
        if (!blog || !blog.published)
            return res.status(404).json({ success: false, message: 'Blog not found' });
        return res.json({ success: true, data: blog });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getBlogBySlug = getBlogBySlug;
// ─── Admin: List all blogs (published + draft) ────────────────────────────────
const getAllBlogsAdmin = async (req, res) => {
    try {
        const blogs = await prisma_1.default.blog.findMany({ orderBy: { createdAt: 'desc' } });
        return res.json({ success: true, data: blogs });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllBlogsAdmin = getAllBlogsAdmin;
// ─── Admin: Create blog ────────────────────────────────────────────────────────
const createBlog = async (req, res) => {
    try {
        const { title, slug, summary, content, imageUrl, published } = req.body;
        if (!title || !slug || !content) {
            return res.status(400).json({ success: false, message: 'title, slug and content are required' });
        }
        const blog = await prisma_1.default.blog.create({
            data: { title, slug, summary: summary || '', content, imageUrl, published: published !== false }
        });
        return res.status(201).json({ success: true, data: blog });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.createBlog = createBlog;
// ─── Admin: Update blog ────────────────────────────────────────────────────────
const updateBlog = async (req, res) => {
    try {
        const { title, slug, summary, content, imageUrl, published } = req.body;
        const blog = await prisma_1.default.blog.update({
            where: { id: parseInt(req.params.id) },
            data: { title, slug, summary, content, imageUrl, published }
        });
        return res.json({ success: true, data: blog });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateBlog = updateBlog;
// ─── Admin: Delete blog ────────────────────────────────────────────────────────
const deleteBlog = async (req, res) => {
    try {
        await prisma_1.default.blog.delete({ where: { id: parseInt(req.params.id) } });
        return res.json({ success: true, message: 'Blog deleted' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteBlog = deleteBlog;
//# sourceMappingURL=blogs.controller.js.map