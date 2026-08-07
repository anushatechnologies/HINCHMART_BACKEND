"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductBySlug = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getProducts = async (req, res) => {
    try {
        const { category, brand, search, minPrice, maxPrice, stockStatus, page = '1', limit = '1000' } = req.query;
        const user = req.user;
        const where = {
            deletedAt: null
        };
        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'VENDOR')) {
            where.isActive = true;
            where.approvalStatus = { in: ['APPROVED', 'LIVE'] };
        }
        if (user?.role === 'VENDOR') {
            where.vendorId = user.id;
        }
        if (category)
            where.category = { slug: category };
        if (brand)
            where.brand = { contains: brand };
        if (search)
            where.name = { contains: search };
        if (stockStatus)
            where.stockStatus = stockStatus;
        if (minPrice || maxPrice) {
            where.basePrice = {};
            if (minPrice)
                where.basePrice.gte = parseFloat(minPrice);
            if (maxPrice)
                where.basePrice.lte = parseFloat(maxPrice);
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await prisma_1.default.product.count({ where });
        let products = await prisma_1.default.product.findMany({
            where,
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                videos: true,
                rentalDetails: true
            },
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        });
        if (user?.companyId) {
            const contracts = await prisma_1.default.companyContract.findMany({
                where: { companyId: user.companyId, isActive: true }
            });
            if (contracts.length > 0) {
                products = products.map((prod) => {
                    const contract = contracts.find(c => c.productId === prod.id);
                    if (contract) {
                        prod.basePrice = contract.customPrice;
                        prod.isContractPrice = true;
                    }
                    return prod;
                });
            }
        }
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProducts = getProducts;
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const user = req.user;
        const product = await prisma_1.default.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                videos: true,
                variants: true,
                vendor: {
                    select: { id: true, companyName: true, logoUrl: true }
                },
                rentalDetails: true,
                reviews: {
                    include: {
                        user: { select: { name: true } }
                    },
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!product || product.deletedAt) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        if (user?.companyId) {
            const contract = await prisma_1.default.companyContract.findFirst({
                where: { companyId: user.companyId, productId: product.id, isActive: true }
            });
            if (contract) {
                product.basePrice = contract.customPrice;
                product.isContractPrice = true;
            }
        }
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProductBySlug = getProductBySlug;
const createProduct = async (req, res) => {
    try {
        const { name, brand, categoryId, basePrice, mrp, sku, modelNumber, description, gstPercent, isRentable, rentPricePerDay, isSameDayDelivery } = req.body;
        if (!name || !categoryId || !basePrice) {
            res.status(400).json({ success: false, message: 'Name, Category, and Price are required' });
            return;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
        const product = await prisma_1.default.product.create({
            data: {
                name,
                slug,
                brand: brand || 'Generic',
                categoryId: parseInt(categoryId, 10),
                vendorId: req.user?.id || 1,
                basePrice: parseFloat(basePrice),
                mrp: mrp ? parseFloat(mrp) : parseFloat(basePrice) * 1.2,
                gstPercent: gstPercent ? parseFloat(gstPercent) : 18.00,
                modelNumber: modelNumber || sku || `SKU-${Date.now()}`,
                description: description || '',
                approvalStatus: 'APPROVED',
                isActive: true,
                isRentable: Boolean(isRentable),
                rentPricePerDay: rentPricePerDay ? parseFloat(rentPricePerDay) : null,
                isSameDayDelivery: Boolean(isSameDayDelivery)
            }
        });
        res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, brand, productType, modelNumber, sku, categoryId, vendorId, barcode, hsnCode, moq, countryOfOrigin, warranty, basePrice, mrp, bulkPrice, dealerPrice, gstPercent, stockStatus, approvalStatus, isActive, isRentable, rentPricePerDay, minRentalDays, isSameDayDelivery, description, technicalSpecs, features, metaTitle, metaDescription, metaKeywords, imageUrls, videoUrl } = req.body;
        const productIdInt = parseInt(id, 10);
        const updateData = {};
        if (name)
            updateData.name = name;
        if (slug)
            updateData.slug = slug;
        if (brand !== undefined)
            updateData.brand = brand;
        if (productType)
            updateData.productType = productType;
        if (modelNumber || sku)
            updateData.modelNumber = modelNumber || sku;
        if (categoryId)
            updateData.categoryId = parseInt(categoryId, 10);
        if (vendorId)
            updateData.vendorId = parseInt(vendorId, 10);
        if (barcode !== undefined)
            updateData.barcode = barcode;
        if (hsnCode !== undefined)
            updateData.hsnCode = hsnCode;
        if (moq !== undefined)
            updateData.moq = parseInt(moq, 10);
        if (countryOfOrigin !== undefined)
            updateData.countryOfOrigin = countryOfOrigin;
        if (warranty !== undefined)
            updateData.warranty = warranty;
        if (basePrice !== undefined)
            updateData.basePrice = parseFloat(basePrice);
        if (mrp !== undefined)
            updateData.mrp = parseFloat(mrp);
        if (bulkPrice !== undefined)
            updateData.bulkPrice = bulkPrice ? parseFloat(bulkPrice) : null;
        if (dealerPrice !== undefined)
            updateData.dealerPrice = dealerPrice ? parseFloat(dealerPrice) : null;
        if (gstPercent !== undefined)
            updateData.gstPercent = parseFloat(gstPercent);
        if (stockStatus)
            updateData.stockStatus = stockStatus;
        if (approvalStatus)
            updateData.approvalStatus = approvalStatus;
        if (isActive !== undefined)
            updateData.isActive = Boolean(isActive);
        if (isRentable !== undefined)
            updateData.isRentable = Boolean(isRentable);
        if (rentPricePerDay !== undefined)
            updateData.rentPricePerDay = rentPricePerDay ? parseFloat(rentPricePerDay) : null;
        if (minRentalDays !== undefined)
            updateData.minRentalDays = minRentalDays ? parseInt(minRentalDays, 10) : null;
        if (isSameDayDelivery !== undefined)
            updateData.isSameDayDelivery = Boolean(isSameDayDelivery);
        if (description !== undefined)
            updateData.description = description;
        if (technicalSpecs !== undefined)
            updateData.technicalSpecs = typeof technicalSpecs === 'string' ? technicalSpecs : JSON.stringify(technicalSpecs);
        if (features !== undefined)
            updateData.features = typeof features === 'string' ? features : JSON.stringify(features);
        if (metaTitle !== undefined)
            updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined)
            updateData.metaDescription = metaDescription;
        if (metaKeywords !== undefined)
            updateData.metaKeywords = metaKeywords;
        const product = await prisma_1.default.product.update({
            where: { id: productIdInt },
            data: updateData,
            include: {
                category: true,
                images: true,
                videos: true
            }
        });
        // Handle Image URLs update if provided
        if (Array.isArray(imageUrls)) {
            // Delete existing images and recreate
            await prisma_1.default.productImage.deleteMany({ where: { productId: productIdInt } });
            if (imageUrls.length > 0) {
                await prisma_1.default.productImage.createMany({
                    data: imageUrls.map((url, index) => ({
                        productId: productIdInt,
                        url,
                        isPrimary: index === 0,
                        sortOrder: index
                    }))
                });
            }
        }
        // Handle Video URL update if provided
        if (videoUrl !== undefined) {
            await prisma_1.default.productVideo.deleteMany({ where: { productId: productIdInt } });
            if (videoUrl && videoUrl.trim()) {
                await prisma_1.default.productVideo.create({
                    data: {
                        productId: productIdInt,
                        url: videoUrl.trim(),
                        title: `${product.name} Video`,
                        type: 'YOUTUBE'
                    }
                });
            }
        }
        const reFetched = await prisma_1.default.product.findUnique({
            where: { id: productIdInt },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
                videos: true
            }
        });
        res.status(200).json({ success: true, data: reFetched, message: 'Product updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.product.update({
            where: { id: parseInt(id, 10) },
            data: { deletedAt: new Date(), isActive: false }
        });
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=products.controller.js.map