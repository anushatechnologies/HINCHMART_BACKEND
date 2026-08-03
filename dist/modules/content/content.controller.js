"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePageContent = exports.getPageContent = exports.getActiveDeals = exports.getBlogs = exports.getTestimonials = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// Testimonials
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await prisma_1.default.testimonial.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: testimonials });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTestimonials = getTestimonials;
// Blogs
const getBlogs = async (req, res) => {
    try {
        const blogs = await prisma_1.default.blog.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: blogs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBlogs = getBlogs;
// Deals
const getActiveDeals = async (req, res) => {
    try {
        const now = new Date();
        const deals = await prisma_1.default.deal.findMany({
            where: {
                isActive: true,
                startTime: { lte: now },
                endTime: { gte: now }
            },
            include: {
                product: {
                    include: { images: true }
                }
            }
        });
        res.json({ success: true, data: deals });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getActiveDeals = getActiveDeals;
// ─── Legal & Corporate Pages (PageContent) ───────────────────────────────────
const getPageContent = async (req, res) => {
    try {
        const { slug } = req.params;
        let page = await prisma_1.default.pageContent.findUnique({ where: { slug } });
        if (!page) {
            // Seed default content if not exists
            const titles = {
                'privacy-policy': 'Privacy Policy',
                'terms-of-service': 'Terms of Service',
                'shipping-policy': 'Shipping Policy',
                'about': 'About Us'
            };
            if (titles[slug]) {
                page = await prisma_1.default.pageContent.create({
                    data: {
                        slug,
                        title: titles[slug],
                        content: `<h1>${titles[slug]}</h1>\n<p>This is a placeholder for the ${titles[slug]}. Please update this content in the admin panel.</p>`,
                    }
                });
            }
            else {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
        }
        res.json({ success: true, data: page });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPageContent = getPageContent;
const updatePageContent = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content, isActive } = req.body;
        const page = await prisma_1.default.pageContent.upsert({
            where: { slug },
            update: { title, content, isActive },
            create: { slug, title, content, isActive: isActive ?? true }
        });
        res.json({ success: true, data: page });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updatePageContent = updatePageContent;
//# sourceMappingURL=content.controller.js.map