"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.addAddress = exports.getAddresses = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await prisma_1.default.address.findMany({
            where: { userId }
        });
        res.json({ success: true, data: addresses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAddresses = getAddresses;
const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { label, line1, line2, city, state, pincode, isDefault } = req.body;
        // If setting as default, unset others first
        if (isDefault) {
            await prisma_1.default.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        const address = await prisma_1.default.address.create({
            data: {
                userId,
                label,
                line1,
                line2,
                city,
                state,
                pincode,
                isDefault: isDefault || false
            }
        });
        res.status(201).json({ success: true, data: address });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addAddress = addAddress;
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.address.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Address deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteAddress = deleteAddress;
//# sourceMappingURL=addresses.controller.js.map