"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestBrandAccess = exports.requestNewBrand = exports.getVendorBrands = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Get all brand requests and access items for a vendor
 * GET /api/vendors/:id/brands
 */
const getVendorBrands = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'Invalid vendor ID' });
            return;
        }
        const access = await prisma.vendorBrandAccess.findMany({
            where: { vendorId },
            include: { brand: true },
            orderBy: { createdAt: 'desc' }
        });
        const requests = await prisma.vendorBrandRequest.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: { access, requests } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVendorBrands = getVendorBrands;
/**
 * Submit a new brand request (Option B - Brand Owner)
 * POST /api/vendors/:id/brands/request-new
 */
const requestNewBrand = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'Invalid vendor ID' });
            return;
        }
        const { brandName, brandLogoUrl, description, trademarkNumber, website, brandDocuments, authorizationDocumentUrl, // can also be uploaded if they are not the sole owner but are adding a new brand, though usually Option B is OWNER
        brandDocumentUrl, gstin } = req.body;
        if (!brandName) {
            res.status(400).json({ success: false, message: 'Brand name is required' });
            return;
        }
        // Check if brand request already exists for this vendor
        const existing = await prisma.vendorBrandRequest.findFirst({
            where: { vendorId, brandName }
        });
        if (existing) {
            res.status(400).json({ success: false, message: 'A request for this brand already exists' });
            return;
        }
        const newRequest = await prisma.vendorBrandRequest.create({
            data: {
                vendorId,
                brandName,
                brandLogoUrl,
                description,
                trademarkNumber,
                website,
                brandDocuments: brandDocuments || [],
                brandDocumentUrl,
                authorizationDocumentUrl,
                gstin,
                status: 'PENDING'
            }
        });
        res.status(201).json({ success: true, message: 'Brand registration request submitted successfully', data: newRequest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestNewBrand = requestNewBrand;
/**
 * Submit a request to access an existing brand (Option A & C - Distributor/Dealer)
 * POST /api/vendors/:id/brands/request-access
 */
const requestBrandAccess = async (req, res) => {
    try {
        const vendorId = parseInt(req.params.id, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'Invalid vendor ID' });
            return;
        }
        const { brandId, accessType, // DISTRIBUTOR, DEALER, RESELLER
        authorizationDocumentUrl, distributorAgreementUrl } = req.body;
        if (!brandId || !accessType) {
            res.status(400).json({ success: false, message: 'Brand ID and Access Type are required' });
            return;
        }
        // Check if access request already exists
        const existing = await prisma.vendorBrandAccess.findUnique({
            where: { vendorId_brandId: { vendorId, brandId } }
        });
        if (existing) {
            res.status(400).json({ success: false, message: 'Access request for this brand already exists' });
            return;
        }
        const newAccess = await prisma.vendorBrandAccess.create({
            data: {
                vendorId,
                brandId,
                accessType,
                authorizationDocumentUrl,
                distributorAgreementUrl,
                status: 'PENDING'
            }
        });
        res.status(201).json({ success: true, message: 'Brand access request submitted successfully', data: newAccess });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.requestBrandAccess = requestBrandAccess;
//# sourceMappingURL=vendor-brands.controller.js.map