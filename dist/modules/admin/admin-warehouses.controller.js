"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWarehousesAdmin = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllWarehousesAdmin = async (req, res) => {
    try {
        const warehouses = await prisma.vendorWarehouse.findMany({
            include: {
                vendor: {
                    select: {
                        id: true,
                        companyName: true,
                        contactEmail: true,
                        contactPhone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: warehouses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllWarehousesAdmin = getAllWarehousesAdmin;
//# sourceMappingURL=admin-warehouses.controller.js.map