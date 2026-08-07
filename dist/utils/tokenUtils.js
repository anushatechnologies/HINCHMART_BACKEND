"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESS_SECRET = void 0;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshTokenString = generateRefreshTokenString;
exports.saveRefreshToken = saveRefreshToken;
exports.rotateRefreshToken = rotateRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllTokensFor = revokeAllTokensFor;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'hinchmart_access_secret_2024!';
exports.ACCESS_SECRET = ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hinchmart_refresh_secret_2024!';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
/** Generate a short-lived access token (15 min) */
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}
/** Generate a random opaque refresh token (UUID) */
function generateRefreshTokenString() {
    return crypto_1.default.randomUUID() + '-' + crypto_1.default.randomUUID(); // double UUID for extra entropy
}
/** Store a refresh token in the database */
async function saveRefreshToken(token, userType, ids) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await prisma.refreshToken.create({
        data: {
            token,
            userType,
            userId: ids.userId ?? null,
            vendorId: ids.vendorId ?? null,
            adminId: ids.adminId ?? null,
            expiresAt,
            revoked: false
        }
    });
}
/** Validate refresh token, rotate it, return new token pair */
async function rotateRefreshToken(oldToken) {
    const record = await prisma.refreshToken.findUnique({
        where: { token: oldToken }
    });
    if (!record || record.revoked || record.expiresAt < new Date()) {
        return null; // Invalid, revoked, or expired
    }
    // Revoke the old token (rotation)
    await prisma.refreshToken.update({
        where: { id: record.id },
        data: { revoked: true }
    });
    // Build payload from stored record
    let payload;
    if (record.userType === 'VENDOR') {
        payload = { id: record.vendorId, role: 'VENDOR' };
    }
    else if (record.userType === 'ADMIN') {
        payload = { id: record.adminId, role: 'ADMIN' };
    }
    else {
        payload = { id: record.userId, role: 'USER' };
    }
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshTokenString();
    // Save the new refresh token
    await saveRefreshToken(newRefreshToken, record.userType, {
        userId: record.userId,
        vendorId: record.vendorId,
        adminId: record.adminId
    });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
/** Revoke a refresh token (logout) */
async function revokeRefreshToken(token) {
    await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true }
    });
}
/** Revoke ALL refresh tokens for a user/vendor/admin (logout all devices) */
async function revokeAllTokensFor(userType, id) {
    const where = { userType, revoked: false };
    if (userType === 'VENDOR')
        where.vendorId = id;
    else if (userType === 'ADMIN')
        where.adminId = id;
    else
        where.userId = id;
    await prisma.refreshToken.updateMany({ where, data: { revoked: true } });
}
//# sourceMappingURL=tokenUtils.js.map