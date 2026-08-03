"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sapInventoryWebhook = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const sapInventoryWebhook = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { sku, quantity }
        if (!Array.isArray(updates)) {
            res.status(400).json({ success: false, message: 'Invalid payload. Expected updates array.' });
            return;
        }
        const results = [];
        for (const item of updates) {
            if (item.sku && typeof item.quantity === 'number') {
                const variant = await prisma_1.default.productVariant.findFirst({ where: { sku: item.sku } });
                if (variant) {
                    await prisma_1.default.productVariant.update({
                        where: { id: variant.id },
                        data: { stockQty: item.quantity }
                    });
                    results.push({ sku: item.sku, status: 'updated', newStock: item.quantity });
                }
                else {
                    results.push({ sku: item.sku, status: 'not_found' });
                }
            }
        }
        res.status(200).json({ success: true, results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.sapInventoryWebhook = sapInventoryWebhook;
//# sourceMappingURL=erp.controller.js.map