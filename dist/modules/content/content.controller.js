"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePageContent = exports.getPageContent = exports.getActiveDeals = exports.getBlogs = exports.getTestimonials = exports.getPrivacyPolicy = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getPrivacyPolicy = async (_req, res) => {
    res.json({
        success: true,
        data: {
            title: 'Privacy Policy – HINCHMART',
            effectiveDate: '3 August 2026',
            company: 'Anusha Bazaar Technologies Pvt. Ltd.',
            app: 'HINCHMART',
            website: 'https://hinchmart.com',
            contactEmail: 'support@hinchmart.com',
            sections: [
                { title: 'Information We Collect', content: ['Name, email address, phone number, user ID, business details, and postal or delivery address.', 'Approximate and precise location, when permission is granted, for nearby services, delivery, pickup, and location-based functionality.', 'Purchase history, order details, inquiries, RFQs, and transaction-related records.', 'In-app messages exchanged between buyers, suppliers, service providers, and other users.', 'Photos, product images, profile images, and uploaded files or documents such as invoices, certificates, catalogues, or verification documents.', 'App interactions, in-app search history, listings, reviews, inquiries, and other user-generated content.', 'Device or other identifiers, crash logs, diagnostics, and app performance information.'] },
                { title: 'How We Use Information', content: ['Create, maintain, and secure user accounts.', 'Enable product listings, inquiries, quotations, orders, delivery, chat, and customer support.', 'Connect buyers with suppliers, service providers, and delivery partners.', 'Process and maintain order and purchase history.', 'Provide location-based services and improve delivery or service availability.', 'Send service messages, order updates, security alerts, and support communications.', 'Detect fraud, abuse, unauthorized access, and policy violations.', 'Monitor app reliability, diagnose crashes, and improve app performance and functionality.', 'Comply with legal, regulatory, tax, accounting, and law-enforcement obligations.'] },
                { title: 'Location Data', content: ['HINCHMART may request approximate or precise location permission. Location is used only for features such as nearby sellers or services, delivery, pickup, address selection, and service availability. Users can control location permissions through their device settings, although some features may not work correctly without location access.'] },
                { title: 'Photos, Camera, Files, and Documents', content: ['We may request access to the camera, photos, or files only when users choose to upload product images, profile images, business documents, invoices, catalogues, delivery proof, or other content required for app functionality.'] },
                { title: 'In-App Messages and User Content', content: ['Messages, inquiries, listings, reviews, product details, and other content submitted by users may be stored to provide the requested service, resolve disputes, prevent abuse, and maintain marketplace records.'] },
                { title: 'Data Sharing', content: ['We do not sell personal information. We may share limited information with suppliers, buyers, service providers, delivery partners, payment service providers, cloud hosting providers, analytics providers, communication providers, and government authorities where legally required.'] },
                { title: 'Data Security', content: ['We use reasonable technical and organizational safeguards designed to protect information against unauthorized access, loss, misuse, alteration, or disclosure.'] },
                { title: 'Data Retention', content: ['We retain information only for as long as necessary to provide services, maintain business and transaction records, resolve disputes, prevent fraud, and meet legal obligations.'] },
                { title: 'Account and Data Deletion', content: ['Users may request deletion of their account and associated personal data through the account deletion form or by contacting us. Certain information may be retained where required for legal, tax, accounting, fraud prevention, dispute resolution, or regulatory purposes.'] },
                { title: 'User Choices and Rights', content: ['Users may request access, correction, or deletion of their personal information, subject to applicable law. Users may also control permissions such as location, camera, photos, and notifications through device settings.'] },
                { title: "Children's Privacy", content: ['HINCHMART is intended for business and marketplace users and is not directed to children under 18. We do not knowingly collect personal information from children.'] },
                { title: 'Third-Party Services', content: ['The app may use third-party services such as Google Play services, Firebase, mapping services, cloud hosting, payment gateways, and notification providers. These services may process information according to their own privacy policies.'] },
                { title: 'Changes to This Privacy Policy', content: ['We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date.'] },
                { title: 'Contact Us', content: ['Company: Anusha Bazaar Technologies Pvt. Ltd.', 'App: HINCHMART', 'Email: support@hinchmart.com', 'Website: https://hinchmart.com'] }
            ],
            copyright: '© 2026 Anusha Bazaar Technologies Pvt. Ltd. All rights reserved.'
        }
    });
};
exports.getPrivacyPolicy = getPrivacyPolicy;
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