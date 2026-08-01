import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Export Products as CSV ──────────────────────────────────────────────────

export const exportProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const products = await prisma.product.findMany({
      where: { vendorId, deletedAt: null },
      include: { category: true, variants: true }
    });

    const csvHeader = [
      'Product Name', 'SKU', 'Category', 'Base Price', 'MRP', 'GST %',
      'MOQ', 'Stock Qty', 'Stock Status', 'Brand', 'Barcode', 'Model Number',
      'HSN Code', 'Country of Origin', 'Warranty', 'Meta Title', 'Meta Description'
    ].join(',');

    const csvRows = products.map(p => {
      const variant = p.variants[0];
      const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
      return [
        escape(p.name),
        escape(variant?.sku || ''),
        escape(p.category.name),
        p.basePrice, p.mrp, p.gstPercent,
        p.moq, escape(variant?.stockQty || 0),
        escape(p.stockStatus),
        escape(p.brand || ''), escape(p.barcode || ''),
        escape(p.modelNumber || ''), escape(p.hsnCode || ''),
        escape(p.countryOfOrigin || ''), escape(p.warranty || ''),
        escape((p as any).metaTitle || ''), escape((p as any).metaDescription || '')
      ].join(',');
    });

    const csv = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products_${vendorId}_${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Download CSV Template ───────────────────────────────────────────────────

export const downloadTemplate = async (req: Request, res: Response): Promise<void> => {
  const csvTemplate = [
    'Product Name,Category Name,Base Price,MRP,GST %,MOQ,Stock Qty,Brand,Barcode,Model Number,HSN Code,Country of Origin,Warranty,Description',
    'Example Product,Tools,999.00,1299.00,18,10,100,MyBrand,BAR123,MDL-001,84714990,India,1 Year,This is a sample product description'
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="product_import_template.csv"');
  res.status(200).send(csvTemplate);
};

// ─── Import Products from CSV ────────────────────────────────────────────────

export const importProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, csvData } = req.body;

    if (!vendorId || !csvData) {
      res.status(400).json({ success: false, message: 'vendorId and csvData are required' });
      return;
    }

    const vid = parseInt(vendorId, 10);
    const lines = csvData.split('\n').filter((l: string) => l.trim());
    if (lines.length < 2) {
      res.status(400).json({ success: false, message: 'CSV must have at least one data row after the header' });
      return;
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase().replace(/ /g, ''));
    const results = { created: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => { row[h] = values[idx] || ''; });

      try {
        // Find or auto-create category
        let category = await prisma.category.findFirst({ where: { name: { equals: row['categoryname'] } } });
        if (!category) {
          const slug = row['categoryname'].toLowerCase().replace(/[^a-z0-9]+/g, '-');
          category = await prisma.category.create({ data: { name: row['categoryname'], slug } });
        }

        const slug = (row['productname'] || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now() + '-' + i;

        await prisma.product.create({
          data: {
            name: row['productname'] || 'Unnamed Product',
            slug,
            categoryId: category.id,
            vendorId: vid,
            basePrice: parseFloat(row['baseprice']) || 0,
            mrp: parseFloat(row['mrp']) || 0,
            gstPercent: parseFloat(row['gst%']) || 0,
            moq: parseInt(row['moq']) || 1,
            brand: row['brand'] || null,
            barcode: row['barcode'] || null,
            modelNumber: row['modelnumber'] || null,
            hsnCode: row['hsncode'] || null,
            countryOfOrigin: row['countryoforigin'] || null,
            warranty: row['warranty'] || null,
            description: row['description'] || null,
            stockStatus: 'IN_STOCK',
            approvalStatus: 'PENDING',
            variants: {
              create: {
                sku: 'IMPORT-' + Date.now() + '-' + i,
                price: parseFloat(row['baseprice']) || 0,
                stockQty: parseInt(row['stockqty']) || 0
              }
            }
          }
        });
        results.created++;
      } catch (rowErr: any) {
        results.errors.push(`Row ${i + 1}: ${rowErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete. ${results.created} products created.`,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
