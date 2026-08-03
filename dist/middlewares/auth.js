"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'secret123';
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.query.token) {
        token = req.query.token;
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Token expired or invalid' });
    }
};
exports.requireAuth = requireAuth;
// Alias for backward compatibility
exports.authenticate = exports.requireAuth;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.query.token) {
        token = req.query.token;
    }
    if (!token) {
        return next();
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
    }
    catch (error) {
        // Ignore invalid token in optionalAuth
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map