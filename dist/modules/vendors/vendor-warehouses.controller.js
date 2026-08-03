"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWarehouse = exports.getWarehouses = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getWarehouses = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const warehouses = await prisma.vendorWarehouse.findMany({
            where: { vendorId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: warehouses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch warehouses', error: error.message });
    }
};
exports.getWarehouses = getWarehouses;
const addWarehouse = async (req, res) => {
    try {
        const { vendorId, name, address, city, state, pincode, contactNum, isPrimary } = req.body;
        if (!vendorId || !name || !address || !city || !state || !pincode || !contactNum) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        // If this is set as primary, unset others for this vendor
        if (isPrimary) {
            await prisma.vendorWarehouse.updateMany({
                where: { vendorId: parseInt(vendorId, 10) },
                data: { isPrimary: false }
            });
        }
        const warehouse = await prisma.vendorWarehouse.create({
            data: {
                vendorId: parseInt(vendorId, 10),
                name,
                address,
                city,
                state,
                pincode,
                contactNum,
                isPrimary: isPrimary || false
            }
        });
        res.status(201).json({ success: true, message: 'Warehouse added successfully', data: warehouse });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add warehouse', error: error.message });
    }
};
exports.addWarehouse = addWarehouse;
//# sourceMappingURL=vendor-warehouses.controller.js.map