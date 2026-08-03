"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaq = exports.updateFaq = exports.createFaq = exports.getAllFaqsAdmin = exports.getFaqs = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Public: Get all active FAQs ───────────────────────────────────────────────
const getFaqs = async (req, res) => {
    try {
        const faqs = await prisma_1.default.faq.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { order: 'asc' }]
        });
        // Group by category
        const grouped = faqs.reduce((acc, faq) => {
            if (!acc[faq.category])
                acc[faq.category] = [];
            acc[faq.category].push(faq);
            return acc;
        }, {});
        return res.json({ success: true, data: grouped });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getFaqs = getFaqs;
// ─── Admin: Get all FAQs (including inactive) ──────────────────────────────────
const getAllFaqsAdmin = async (req, res) => {
    try {
        const faqs = await prisma_1.default.faq.findMany({
            orderBy: [{ category: 'asc' }, { order: 'asc' }]
        });
        return res.json({ success: true, data: faqs });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllFaqsAdmin = getAllFaqsAdmin;
// ─── Admin: Create FAQ ────────────────────────────────────────────────────────
const createFaq = async (req, res) => {
    try {
        const { question, answer, category, order, isActive } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ success: false, message: 'Question and answer are required' });
        }
        const faq = await prisma_1.default.faq.create({
            data: {
                question,
                answer,
                category: category || 'GENERAL',
                order: order ? parseInt(order) : 0,
                isActive: isActive !== false
            }
        });
        return res.status(201).json({ success: true, data: faq });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.createFaq = createFaq;
// ─── Admin: Update FAQ ────────────────────────────────────────────────────────
const updateFaq = async (req, res) => {
    try {
        const { question, answer, category, order, isActive } = req.body;
        const faq = await prisma_1.default.faq.update({
            where: { id: parseInt(req.params.id) },
            data: {
                question,
                answer,
                category,
                order: order ? parseInt(order) : undefined,
                isActive
            }
        });
        return res.json({ success: true, data: faq });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateFaq = updateFaq;
// ─── Admin: Delete FAQ ────────────────────────────────────────────────────────
const deleteFaq = async (req, res) => {
    try {
        await prisma_1.default.faq.delete({ where: { id: parseInt(req.params.id) } });
        return res.json({ success: true, message: 'FAQ deleted' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteFaq = deleteFaq;
//# sourceMappingURL=faq.controller.js.map