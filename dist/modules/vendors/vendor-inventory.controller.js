"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryHistory = exports.createBatch = exports.getBatches = exports.transferStock = exports.getWarehouseInventory = exports.adjustStock = exports.getInventoryOverview = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Overview & Updates ───────────────────────────────────────────────────────
const getInventoryOverview = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        const filter = req.query.filter; // LOW_STOCK, OUT_OF_STOCK, ALL
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const where = { product: { vendorId, deletedAt: null } };
        if (filter === 'OUT_OF_STOCK') {
            where.stockQty = { lte: 0 };
        }
        else if (filter === 'LOW_STOCK') {
            where.stockQty = { gt: 0, lte: 10 }; // arbitrary low stock threshold, could be dynamic
        }
        const variants = await prisma.productVariant.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, stockStatus: true } }
            },
            orderBy: { stockQty: 'asc' }
        });
        res.status(200).json({ success: true, data: variants });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getInventoryOverview = getInventoryOverview;
const adjustStock = async (req, res) => {
    try {
        const { vendorId, variantId, changeQty, reason, reference } = req.body;
        if (!vendorId || !variantId || changeQty === undefined || !reason) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        const variant = await prisma.productVariant.findUnique({
            where: { id: parseInt(variantId, 10) },
            include: { product: true }
        });
        if (!variant || variant.product.vendorId !== parseInt(vendorId, 10)) {
            res.status(404).json({ success: false, message: 'Variant not found' });
            return;
        }
        const newStock = variant.stockQty + parseInt(changeQty, 10);
        if (newStock < 0) {
            res.status(400).json({ success: false, message: 'Stock cannot be negative' });
            return;
        }
        // Update variant stock & stockStatus
        const stockStatus = newStock === 0 ? 'OUT_OF_STOCK' : (newStock <= 10 ? 'LOW_STOCK' : 'IN_STOCK');
        await prisma.$transaction([
            prisma.productVariant.update({
                where: { id: variant.id },
                data: { stockQty: newStock }
            }),
            prisma.product.update({
                where: { id: variant.productId },
                data: { stockStatus }
            }),
            prisma.inventoryHistory.create({
                data: {
                    vendorId: parseInt(vendorId, 10),
                    variantId: variant.id,
                    changeQty: parseInt(changeQty, 10),
                    reason,
                    reference
                }
            })
        ]);
        res.status(200).json({ success: true, message: 'Stock adjusted successfully', newStock });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adjustStock = adjustStock;
// ─── Warehouses & Transfers ───────────────────────────────────────────────────
const getWarehouseInventory = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const inventory = await prisma.warehouseInventory.findMany({
            where: { warehouse: { vendorId } },
            include: {
                warehouse: true,
                variant: { include: { product: { select: { name: true } } } }
            }
        });
        res.status(200).json({ success: true, data: inventory });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWarehouseInventory = getWarehouseInventory;
const transferStock = async (req, res) => {
    try {
        const { vendorId, variantId, fromWarehouseId, toWarehouseId, quantity } = req.body;
        const qty = parseInt(quantity, 10);
        if (qty <= 0 || fromWarehouseId === toWarehouseId) {
            res.status(400).json({ success: false, message: 'Invalid transfer details' });
            return;
        }
        // Simplified for MVP: In real world, check if 'from' has enough stock.
        // We will just create ledger entries and upsert the destination/source inventory.
        await prisma.$transaction([
            prisma.inventoryHistory.create({
                data: {
                    vendorId: parseInt(vendorId, 10), variantId: parseInt(variantId, 10), warehouseId: parseInt(fromWarehouseId, 10),
                    changeQty: -qty, reason: 'TRANSFER_OUT', reference: `To WH-${toWarehouseId}`
                }
            }),
            prisma.inventoryHistory.create({
                data: {
                    vendorId: parseInt(vendorId, 10), variantId: parseInt(variantId, 10), warehouseId: parseInt(toWarehouseId, 10),
                    changeQty: qty, reason: 'TRANSFER_IN', reference: `From WH-${fromWarehouseId}`
                }
            })
        ]);
        res.status(200).json({ success: true, message: 'Transfer logged successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.transferStock = transferStock;
// ─── Batches ──────────────────────────────────────────────────────────────────
const getBatches = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        const batches = await prisma.productBatch.findMany({
            where: { warehouse: { vendorId } },
            include: {
                variant: { include: { product: { select: { name: true } } } },
                warehouse: { select: { name: true } }
            }
        });
        res.status(200).json({ success: true, data: batches });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBatches = getBatches;
const createBatch = async (req, res) => {
    try {
        const { variantId, warehouseId, batchNumber, mfgDate, expDate, stockQty } = req.body;
        const batch = await prisma.productBatch.create({
            data: {
                variantId: parseInt(variantId, 10),
                warehouseId: parseInt(warehouseId, 10),
                batchNumber,
                mfgDate: mfgDate ? new Date(mfgDate) : null,
                expDate: expDate ? new Date(expDate) : null,
                stockQty: parseInt(stockQty, 10)
            }
        });
        res.status(201).json({ success: true, data: batch });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createBatch = createBatch;
// ─── History Ledger ───────────────────────────────────────────────────────────
const getInventoryHistory = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        const history = await prisma.inventoryHistory.findMany({
            where: { vendorId },
            include: {
                variant: { include: { product: { select: { name: true } } } },
                warehouse: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // limit for MVP
        });
        res.status(200).json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getInventoryHistory = getInventoryHistory;
//# sourceMappingURL=vendor-inventory.controller.js.map