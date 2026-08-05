import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, brand, search, minPrice, maxPrice, stockStatus, page = '1', limit = '20' } = req.query;
    const user = (req as any).user;

    const where: any = { 
      isActive: true, 
      approvalStatus: { in: ['APPROVED', 'LIVE'] } 
    };
    
    // Vendor Data Isolation
    if (user?.role === 'VENDOR') {
      where.vendorId = user.id;
      delete where.isActive; // Vendors should see their own draft/inactive products too
      delete where.approvalStatus; // Vendors should see their own drafts and rejected items
    }

    if (category) where.category = { slug: category as string };
    if (brand) where.brand = { contains: brand as string };
    if (search) where.name = { contains: search as string };
    if (stockStatus) where.stockStatus = stockStatus as string;
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const total = await prisma.product.count({ where });

    let products = await prisma.product.findMany({
      where,
      include: { 
        category: true,
        images: { where: { isPrimary: true } },
        rentalDetails: true
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    // ─── Phase 15: Apply Dynamic Contract Pricing ────────────────────────────
    if (user?.companyId) {
      const contracts = await prisma.companyContract.findMany({
        where: { companyId: user.companyId, isActive: true }
      });
      if (contracts.length > 0) {
        products = products.map((prod: any) => {
          const contract = contracts.find(c => c.productId === prod.id);
          if (contract) {
            prod.basePrice = contract.customPrice; // override basePrice
            prod.isContractPrice = true; // flag for frontend
          }
          return prod;
        });
      }
    }

    res.json({ success: true, data: products, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const user = (req as any).user;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { include: { parent: true } },
        vendor: true,
        variants: { include: { images: true } },
        images: true,
        // New B2B Relations
        documents: true,
        videos: true,
        qnas: {
          where: { isAnswered: true },
          include: { user: { select: { name: true } } },
          take: 10
        },
        relatedFrom: {
          include: {
            relatedProduct: {
              include: { images: { where: { isPrimary: true } } }
            }
          },
          take: 6
        },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          take: 5
        },
        rentalDetails: true,
        rentalAvailabilities: {
          where: {
            endDate: { gte: new Date() } // Only fetch upcoming blocks
          }
        }
      }
    });

    if (!product || (product.approvalStatus !== 'APPROVED' && product.approvalStatus !== 'LIVE' && user?.id !== product.vendorId && user?.role !== 'ADMIN')) {
      return res.status(404).json({ success: false, message: 'Product not found or not available' });
    }

    // ─── Phase 15: Apply Dynamic Contract Pricing ────────────────────────────
    if (user?.companyId) {
      const contract = await prisma.companyContract.findUnique({
        where: {
          companyId_productId: { companyId: user.companyId, productId: product.id }
        }
      });
      
      if (contract && contract.isActive) {
        (product as any).basePrice = contract.customPrice;
        (product as any).isContractPrice = true;
        // Optionally override variant prices if they have the same logic, 
        // but for now we'll just override the product basePrice.
      }
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { 
      name, slug, brand, categoryId, description, basePrice, mrp, gstPercent,
      barcode, modelNumber, hsnCode, moq, countryOfOrigin, warranty, technicalSpecs,
      bulkPrice, dealerPrice, stockStatus, vendorId, features
    } = req.body;

    const user = (req as any).user;
    const assignedVendorId = user?.role === 'VENDOR' ? user.id : (vendorId ? parseInt(vendorId) : null);
    
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        brand,
        categoryId: parseInt(categoryId),
        vendorId: assignedVendorId,
        description,
        basePrice: parseFloat(basePrice),
        mrp: parseFloat(mrp),
        gstPercent: parseFloat(gstPercent),
        bulkPrice: bulkPrice ? parseFloat(bulkPrice) : null,
        dealerPrice: dealerPrice ? parseFloat(dealerPrice) : null,
        barcode: barcode || null,
        modelNumber: modelNumber || null,
        hsnCode: hsnCode || null,
        moq: moq ? parseInt(moq) : 1,
        countryOfOrigin: countryOfOrigin || null,
        warranty: warranty || null,
        technicalSpecs: technicalSpecs ? (typeof technicalSpecs === 'string' ? JSON.parse(technicalSpecs) : technicalSpecs) : null,
        features: features ? (typeof features === 'string' ? JSON.parse(features) : features) : null,
        stockStatus: stockStatus || 'IN_STOCK',
      }
    });

    if (req.files && Array.isArray(req.files)) {
      const imagesData = req.files.map((file: any, index: number) => ({
        productId: product.id,
        url: file.path,
        isPrimary: index === 0,
      }));
      if (imagesData.length > 0) {
        await prisma.productImage.createMany({ data: imagesData });
      }
    }

    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, category: true }
    });

    res.status(201).json({ success: true, data: createdProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, brand, description, basePrice, mrp, gstPercent, bulkPrice, dealerPrice, stockStatus, isActive, isRentable, rentPricePerDay, minRentalDays, isSameDayDelivery, moq, barcode, modelNumber, hsnCode, countryOfOrigin, warranty, technicalSpecs, features } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (brand !== undefined) data.brand = brand;
    if (description !== undefined) data.description = description;
    if (basePrice !== undefined) data.basePrice = parseFloat(basePrice);
    if (mrp !== undefined) data.mrp = parseFloat(mrp);
    if (gstPercent !== undefined) data.gstPercent = parseFloat(gstPercent);
    if (bulkPrice !== undefined) data.bulkPrice = bulkPrice ? parseFloat(bulkPrice) : null;
    if (dealerPrice !== undefined) data.dealerPrice = dealerPrice ? parseFloat(dealerPrice) : null;
    if (stockStatus !== undefined) data.stockStatus = stockStatus;
    if (isActive !== undefined) data.isActive = isActive === true || isActive === 'true';
    if (moq !== undefined) data.moq = parseInt(moq);
    if (isRentable !== undefined) data.isRentable = isRentable === true || isRentable === 'true';
    if (rentPricePerDay !== undefined) data.rentPricePerDay = rentPricePerDay ? parseFloat(rentPricePerDay) : null;
    if (minRentalDays !== undefined) data.minRentalDays = minRentalDays ? parseInt(minRentalDays) : null;
    if (isSameDayDelivery !== undefined) data.isSameDayDelivery = isSameDayDelivery === true || isSameDayDelivery === 'true';
    if (barcode !== undefined) data.barcode = barcode || null;
    if (modelNumber !== undefined) data.modelNumber = modelNumber || null;
    if (hsnCode !== undefined) data.hsnCode = hsnCode || null;
    if (countryOfOrigin !== undefined) data.countryOfOrigin = countryOfOrigin || null;
    if (warranty !== undefined) data.warranty = warranty || null;
    if (technicalSpecs !== undefined) data.technicalSpecs = technicalSpecs ? (typeof technicalSpecs === 'string' ? JSON.parse(technicalSpecs) : technicalSpecs) : null;
    if (features !== undefined) data.features = features ? (typeof features === 'string' ? JSON.parse(features) : features) : null;
    
    const updated = await prisma.product.update({ where: { id: parseInt(id) }, data, include: { images: true, category: true } });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
