"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorBrandAccessStatus = exports.getVendorBrandAccessRequests = exports.updateBrandRequestStatus = exports.getBrandRequests = exports.updateBrandStatus = exports.deleteGlobalBrand = exports.updateGlobalBrand = exports.createGlobalBrand = exports.getGlobalBrands = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ================= GLOBAL BRANDS CATALOG =================
const getGlobalBrands = async (req, res) => {
    try {
        const brands = await prisma_1.default.brand.findMany({
            include: {
                _count: {
                    select: { products: true, vendorAccess: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: brands });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getGlobalBrands = getGlobalBrands;
const createGlobalBrand = async (req, res) => {
    try {
        const { name, logoUrl, description, website, trademarkNumber, country, status } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Brand name is required' });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existing = await prisma_1.default.brand.findUnique({ where: { slug } });
        if (existing) {
            res.status(409).json({ success: false, message: 'A brand with this name or slug already exists' });
            return;
        }
        const brand = await prisma_1.default.brand.create({
            data: {
                name,
                slug,
                logoUrl: logoUrl || null,
                description: description || null,
                website: website || null,
                trademarkNumber: trademarkNumber || null,
                country: country || 'India',
                status: status || 'ACTIVE',
                createdBy: req.user?.id || 1,
                approvedBy: req.user?.id || 1
            }
        });
        res.status(201).json({ success: true, data: brand, message: 'Brand created and auto-approved successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createGlobalBrand = createGlobalBrand;
const updateGlobalBrand = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, logoUrl, description, website, trademarkNumber, country, status } = req.body;
        const brand = await prisma_1.default.brand.update({
            where: { id },
            data: {
                ...(name && { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }),
                ...(logoUrl !== undefined && { logoUrl }),
                ...(description !== undefined && { description }),
                ...(website !== undefined && { website }),
                ...(trademarkNumber !== undefined && { trademarkNumber }),
                ...(country !== undefined && { country }),
                ...(status && { status })
            }
        });
        res.status(200).json({ success: true, data: brand, message: 'Brand updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateGlobalBrand = updateGlobalBrand;
const deleteGlobalBrand = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const productCount = await prisma_1.default.product.count({ where: { brandId: id } });
        if (productCount > 0) {
            res.status(400).json({
                success: false,
                message: `Cannot delete brand. It is linked to ${productCount} active products. Change status to INACTIVE instead.`
            });
            return;
        }
        await prisma_1.default.brand.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Brand deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteGlobalBrand = deleteGlobalBrand;
const updateBrandStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status } = req.body;
        if (!['ACTIVE', 'INACTIVE', 'PENDING'].includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }
        const brand = await prisma_1.default.brand.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ success: true, data: brand, message: `Brand status updated to ${status}` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBrandStatus = updateBrandStatus;
// ================= BRAND REGISTRATION REQUESTS =================
const getBrandRequests = async (req, res) => {
    try {
        const requests = await prisma_1.default.brandRequest.findMany({
            include: {
                vendor: { select: { id: true, companyName: true, contactEmail: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: requests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBrandRequests = getBrandRequests;
const updateBrandRequestStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status, adminRemark } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }
        if (status === 'REJECTED' && !adminRemark) {
            res.status(400).json({ success: false, message: 'Admin remark is required for rejection' });
            return;
        }
        const request = await prisma_1.default.brandRequest.findUnique({ where: { id } });
        if (!request) {
            res.status(404).json({ success: false, message: 'Brand request not found' });
            return;
        }
        const updatedRequest = await prisma_1.default.brandRequest.update({
            where: { id },
            data: { status, adminRemark }
        });
        if (status === 'APPROVED') {
            const slug = request.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            let brand = await prisma_1.default.brand.findUnique({ where: { name: request.brandName } });
            if (!brand) {
                brand = await prisma_1.default.brand.create({
                    data: {
                        name: request.brandName,
                        slug,
                        logoUrl: request.brandLogoUrl,
                        description: request.description,
                        website: request.website,
                        trademarkNumber: request.trademarkNumber,
                        status: 'ACTIVE',
                        approvedBy: req.user?.id || 1
                    }
                });
            }
            await prisma_1.default.vendorBrandAccess.upsert({
                where: { vendorId_brandId: { vendorId: request.vendorId, brandId: brand.id } },
                update: {
                    accessType: 'OWNER',
                    status: 'APPROVED',
                    adminRemark: 'Automatically granted as brand owner upon approval of registration request.'
                },
                create: {
                    vendorId: request.vendorId,
                    brandId: brand.id,
                    accessType: 'OWNER',
                    status: 'APPROVED',
                    adminRemark: 'Automatically granted as brand owner upon approval of registration request.',
                    approvedBy: req.user?.id || 1
                }
            });
        }
        res.status(200).json({ success: true, data: updatedRequest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBrandRequestStatus = updateBrandRequestStatus;
// ================= VENDOR BRAND ACCESS =================
const getVendorBrandAccessRequests = async (req, res) => {
    try {
        const accessList = await prisma_1.default.vendorBrandAccess.findMany({
            include: {
                vendor: { select: { id: true, companyName: true, contactEmail: true } },
                brand: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: accessList });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVendorBrandAccessRequests = getVendorBrandAccessRequests;
const updateVendorBrandAccessStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { status, adminRemark } = req.body;
        if (status === 'REJECTED' && !adminRemark) {
            res.status(400).json({ success: false, message: 'Admin remark is required for rejection' });
            return;
        }
        const updatedAccess = await prisma_1.default.vendorBrandAccess.update({
            where: { id },
            data: {
                status,
                adminRemark,
                approvedBy: status === 'APPROVED' ? (req.user?.id || 1) : null
            }
        });
        res.status(200).json({ success: true, data: updatedAccess });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateVendorBrandAccessStatus = updateVendorBrandAccessStatus;
//# sourceMappingURL=admin-brands.controller.js.map