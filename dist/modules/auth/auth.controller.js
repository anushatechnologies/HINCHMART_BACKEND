"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.verifyFirebaseToken = void 0;
const client_1 = require("@prisma/client");
const firebase_1 = require("../../utils/firebase");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'hinchmart_super_secret_key_123!';
const verifyFirebaseToken = async (req, res) => {
    try {
        const { token, name, email, referralCode } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Firebase token is required' });
        }
        // Verify token with Firebase Admin
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        const { uid, phone_number, email: firebaseEmail } = decodedToken;
        if (!phone_number && !firebaseEmail) {
            return res.status(400).json({ success: false, message: 'Phone number or Email is required from Firebase authentication' });
        }
        const primaryIdentifier = phone_number || firebaseEmail || uid;
        // Check if user exists by phone (or email if phone is not available)
        let user = await prisma.user.findFirst({
            where: phone_number
                ? { phone: phone_number }
                : { email: firebaseEmail }
        });
        // If new user, create them
        if (!user) {
            // Cast to any to bypass the schema type issues since prisma generate failed due to a locked file
            const createData = {
                phone: phone_number || `no-phone-${uid}`,
                email: email || firebaseEmail || null,
                name: name || null,
                role: 'CUSTOMER',
                status: 'ACTIVE',
                referralCode: referralCode || null,
                language: 'en'
            };
            user = await prisma.user.create({
                data: createData
            });
        }
        // Issue backend JWT token
        const jwtToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            data: {
                token: jwtToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
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
            where: {
                OR: [
                    { phone },
                    ...(email ? [{ email }] : [])
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this phone or email already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const password_hash = await bcryptjs_1.default.hash(password, salt);
        // Cast to any to bypass the schema type issues since prisma generate failed due to a locked file
        const createData = {
            name,
            email: email || null,
            phone,
            password_hash,
            companyName: businessName || null,
            role: 'CUSTOMER',
            status: 'ACTIVE'
        };
        const user = await prisma.user.create({ data: createData });
        const jwtToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token: jwtToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
exports.register = register;
//# sourceMappingURL=auth.controller.js.map