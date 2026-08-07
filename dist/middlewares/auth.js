"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireVendor = exports.requireAdmin = exports.requireRole = exports.authenticate = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'hinchmart_access_secret_2024!';
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
        return res.status(401).json({
            success: false,
            code: 'NO_TOKEN',
            message: 'Unauthorized: Missing or invalid token'
        });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        // Distinguish expired from invalid — clients use TOKEN_EXPIRED to trigger silent refresh
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                code: 'TOKEN_EXPIRED',
                message: 'Access token expired. Please refresh.'
            });
        }
        return res.status(401).json({
            success: false,
            code: 'TOKEN_INVALID',
            message: 'Unauthorized: Token is invalid'
        });
    }
};
exports.requireAuth = requireAuth;
// Alias for backward compatibility
exports.authenticate = exports.requireAuth;
const requireRole = (...roles) => {
    return (req, res, next) => {
        (0, exports.requireAuth)(req, res, () => {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ success: false, code: 'NO_TOKEN', message: 'Unauthorized' });
            }
            if (user.role === 'ADMIN' || roles.includes(user.role)) {
                return next();
            }
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
        });
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('ADMIN');
const requireVendor = (req, res, next) => {
    (0, exports.requireAuth)(req, res, () => {
        const user = req.user;
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ success: false, message: 'Forbidden: Vendor access required' });
        }
        next();
    });
};
exports.requireVendor = requireVendor;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.query.token) {
        token = req.query.token;
    }
    if (!token)
        return next();
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
    }
    catch {
        // silently ignore in optionalAuth
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map