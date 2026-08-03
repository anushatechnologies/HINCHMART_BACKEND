"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Try to find Admin User
        const admin = await prisma_1.default.adminUser.findUnique({ where: { email } });
        if (admin) {
            const isMatch = await bcrypt_1.default.compare(password, admin.passwordHash);
            if (isMatch) {
                const token = jsonwebtoken_1.default.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
                return res.json({
                    success: true,
                    token,
                    data: { id: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' }
                });
            }
        }
        // 2. Try to find Vendor
        const vendor = await prisma_1.default.vendor.findFirst({ where: { contactEmail: email } });
        if (vendor && vendor.passwordHash) {
            const isMatch = await bcrypt_1.default.compare(password, vendor.passwordHash);
            if (isMatch) {
                if (vendor.status !== 'ACTIVE') {
                    return res.status(403).json({ success: false, message: 'Vendor account is suspended or pending approval.' });
                }
                const token = jsonwebtoken_1.default.sign({ id: vendor.id, role: 'VENDOR' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
                return res.json({
                    success: true,
                    token,
                    data: { id: vendor.id, name: vendor.companyName, email: vendor.contactEmail, role: 'VENDOR' }
                });
            }
        }
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adminLogin = adminLogin;
//# sourceMappingURL=admin.auth.controller.js.map