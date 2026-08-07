"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const tokenUtils_1 = require("../../utils/tokenUtils");
const adminLogin = async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const password = req.body.password;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        // 1. Try to find Admin User (Case insensitive check)
        const admin = await prisma_1.default.adminUser.findFirst({
            where: {
                OR: [
                    { email: email },
                    { email: { equals: email } }
                ]
            }
        });
        if (admin) {
            const isMatch = await bcrypt_1.default.compare(password, admin.passwordHash);
            if (isMatch) {
                const accessToken = (0, tokenUtils_1.generateAccessToken)({ id: admin.id, email: admin.email, role: 'ADMIN' });
                const refreshToken = (0, tokenUtils_1.generateRefreshTokenString)();
                try {
                    await (0, tokenUtils_1.saveRefreshToken)(refreshToken, 'ADMIN', { adminId: admin.id });
                }
                catch (e) {
                    console.warn('Failed to persist refresh token to DB:', e);
                }
                return res.json({
                    success: true,
                    accessToken,
                    refreshToken,
                    token: accessToken,
                    data: { id: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' }
                });
            }
        }
        // 2. Try to find Vendor (vendors can also log in through admin panel)
        const vendor = await prisma_1.default.vendor.findFirst({
            where: { contactEmail: email }
        });
        if (vendor && vendor.passwordHash) {
            const isMatch = await bcrypt_1.default.compare(password, vendor.passwordHash);
            if (isMatch) {
                if (vendor.status !== 'ACTIVE') {
                    return res.status(403).json({ success: false, message: 'Vendor account is suspended or pending approval.' });
                }
                const accessToken = (0, tokenUtils_1.generateAccessToken)({ id: vendor.id, email: vendor.contactEmail, role: 'VENDOR' });
                const refreshToken = (0, tokenUtils_1.generateRefreshTokenString)();
                try {
                    await (0, tokenUtils_1.saveRefreshToken)(refreshToken, 'VENDOR', { vendorId: vendor.id });
                }
                catch (e) {
                    console.warn('Failed to persist vendor refresh token to DB:', e);
                }
                return res.json({
                    success: true,
                    accessToken,
                    refreshToken,
                    token: accessToken,
                    data: { id: vendor.id, name: vendor.companyName, email: vendor.contactEmail, role: 'VENDOR' }
                });
            }
        }
        return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.adminLogin = adminLogin;
//# sourceMappingURL=admin.auth.controller.js.map