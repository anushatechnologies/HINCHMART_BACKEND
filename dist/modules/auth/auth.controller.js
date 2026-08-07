"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = exports.verifyFirebaseToken = void 0;
const client_1 = require("@prisma/client");
const firebase_1 = require("../../utils/firebase");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokenUtils_1 = require("../../utils/tokenUtils");
const prisma = new client_1.PrismaClient();
const verifyFirebaseToken = async (req, res) => {
    try {
        const { token, name, email, referralCode } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Firebase token is required' });
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        const { uid, phone_number, email: firebaseEmail } = decodedToken;
        if (!phone_number && !firebaseEmail) {
            return res.status(400).json({ success: false, message: 'Phone number or Email is required from Firebase authentication' });
        }
        let user = await prisma.user.findFirst({
            where: phone_number
                ? { phone: phone_number }
                : { email: firebaseEmail }
        });
        if (!user) {
            const createData = {
                phone: phone_number || `no-phone-${uid}`,
                email: email || firebaseEmail || null,
                name: name || null,
                role: 'CUSTOMER',
                status: 'ACTIVE',
                referralCode: referralCode || null,
                language: 'en'
            };
            user = await prisma.user.create({ data: createData });
        }
        const accessToken = (0, tokenUtils_1.generateAccessToken)({ id: user.id, role: user.role });
        const refreshToken = (0, tokenUtils_1.generateRefreshTokenString)();
        await (0, tokenUtils_1.saveRefreshToken)(refreshToken, 'USER', { userId: user.id });
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            data: {
                accessToken,
                refreshToken,
                // Legacy field for backward compatibility
                token: accessToken,
                user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
            }
        });
    }
    catch (error) {
        console.error('Firebase Auth Error:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired Firebase token' });
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
const register = async (req, res) => {
    try {
        const { name, email, phone, password, businessName } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Phone and password are required' });
        }
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ phone }, ...(email ? [{ email }] : [])] }
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this phone or email already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const password_hash = await bcryptjs_1.default.hash(password, salt);
        const createData = {
            name, email: email || null, phone, password_hash,
            companyName: businessName || null, role: 'CUSTOMER', status: 'ACTIVE'
        };
        const user = await prisma.user.create({ data: createData });
        const accessToken = (0, tokenUtils_1.generateAccessToken)({ id: user.id, role: user.role });
        const refreshToken = (0, tokenUtils_1.generateRefreshTokenString)();
        await (0, tokenUtils_1.saveRefreshToken)(refreshToken, 'USER', { userId: user.id });
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                accessToken,
                refreshToken,
                token: accessToken, // backward compat
                user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
            }
        });
    }
    catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { phone, email, password } = req.body;
        if ((!phone && !email) || !password) {
            return res.status(400).json({ success: false, message: 'Phone/email and password are required' });
        }
        const user = await prisma.user.findFirst({
            where: email ? { email } : { phone }
        });
        if (!user || !user.password_hash) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const accessToken = (0, tokenUtils_1.generateAccessToken)({ id: user.id, role: user.role });
        const refreshToken = (0, tokenUtils_1.generateRefreshTokenString)();
        await (0, tokenUtils_1.saveRefreshToken)(refreshToken, 'USER', { userId: user.id });
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                token: accessToken, // backward compat
                user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
            }
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map