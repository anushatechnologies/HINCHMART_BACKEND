"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInquiryStatus = exports.getInquiries = exports.submitInquiry = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Public: Submit contact inquiry ───────────────────────────────────────────
const submitInquiry = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const inquiry = await prisma_1.default.contactInquiry.create({
            data: { name, email, phone, subject, message }
        });
        return res.status(201).json({ success: true, message: 'Message sent successfully. We will get back to you shortly.', data: inquiry });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.submitInquiry = submitInquiry;
// ─── Admin: Get all inquiries ─────────────────────────────────────────────────
const getInquiries = async (req, res) => {
    try {
        const inquiries = await prisma_1.default.contactInquiry.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, data: inquiries });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.getInquiries = getInquiries;
// ─── Admin: Update inquiry status (NEW -> READ -> REPLIED) ────────────────────
const updateInquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const inquiry = await prisma_1.default.contactInquiry.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        return res.json({ success: true, data: inquiry });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateInquiryStatus = updateInquiryStatus;
//# sourceMappingURL=contact.controller.js.map