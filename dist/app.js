"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const categories_routes_1 = __importDefault(require("./modules/categories/categories.routes"));
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const addresses_routes_1 = __importDefault(require("./modules/addresses/addresses.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/orders.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const reviews_routes_1 = __importDefault(require("./modules/reviews/reviews.routes"));
const wishlist_routes_1 = __importDefault(require("./modules/wishlist/wishlist.routes"));
const banners_routes_1 = __importDefault(require("./modules/banners/banners.routes"));
const coupons_routes_1 = __importDefault(require("./modules/coupons/coupons.routes"));
const rfq_routes_1 = __importDefault(require("./modules/rfq/rfq.routes"));
const content_routes_1 = __importDefault(require("./modules/content/content.routes"));
const search_routes_1 = __importDefault(require("./modules/search/search.routes"));
const filters_routes_1 = __importDefault(require("./modules/filters/filters.routes"));
const account_routes_1 = __importDefault(require("./modules/account/account.routes"));
const companies_routes_1 = __importDefault(require("./modules/companies/companies.routes"));
const vendors_routes_1 = __importDefault(require("./modules/vendors/vendors.routes"));
const settlements_routes_1 = __importDefault(require("./modules/settlements/settlements.routes"));
const logistics_routes_1 = __importDefault(require("./modules/logistics/logistics.routes"));
const po_routes_1 = __importDefault(require("./modules/po/po.routes"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const rentals_routes_1 = __importDefault(require("./modules/rentals/rentals.routes"));
const erp_routes_1 = __importDefault(require("./modules/erp/erp.routes"));
const services_routes_1 = __importDefault(require("./modules/services/services.routes"));
const wallet_routes_1 = __importDefault(require("./modules/wallet/wallet.routes"));
const rewards_routes_1 = __importDefault(require("./modules/rewards/rewards.routes"));
const notifications_routes_1 = __importDefault(require("./modules/notifications/notifications.routes"));
const blogs_routes_1 = __importDefault(require("./modules/blogs/blogs.routes"));
const deals_routes_1 = __importDefault(require("./modules/deals/deals.routes"));
const buying_guides_routes_1 = __importDefault(require("./modules/buying-guides/buying-guides.routes"));
const support_routes_1 = __importDefault(require("./modules/support/support.routes"));
const faq_routes_1 = __importDefault(require("./modules/faq/faq.routes"));
const contact_routes_1 = __importDefault(require("./modules/contact/contact.routes"));
const chat_routes_1 = __importDefault(require("./modules/chat/chat.routes"));
const returns_routes_1 = __importDefault(require("./modules/returns/returns.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const health_routes_1 = __importDefault(require("./modules/health/health.routes"));
const audit_routes_1 = __importDefault(require("./modules/audit/audit.routes"));
const credit_lines_routes_1 = __importDefault(require("./modules/credit/credit-lines.routes"));
const brands_routes_1 = __importDefault(require("./modules/brands/brands.routes"));
const cache_1 = require("./middlewares/cache");
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be served cross-origin
}));
// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Global Rate Limiting (Basic)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
if (process.env.NODE_ENV === 'production') {
    app.use('/api/', limiter);
}
// Strict Rate Limiting for Auth routes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 login/register attempts per minute
    message: { success: false, message: 'Too many authentication attempts, please try again after a minute' }
});
// Middleware
// Configure CORS to use environment variable or fallback to allow all (for development)
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        const isHinchmart = origin.endsWith('hinchmart.com') || origin.includes('localhost') || origin.includes('127.0.0.1');
        if (isHinchmart) {
            return callback(null, true);
        }
        if (process.env.CORS_ORIGIN) {
            const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(url => url.trim());
            if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
                return callback(null, true);
            }
        }
        callback(null, true);
    },
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
// Auto-fix duplicate /api/api path bug if sent by cached frontend bundles
app.use((req, res, next) => {
    if (req.url.startsWith('/api/api/')) {
        req.url = req.url.replace('/api/api/', '/api/');
    }
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
// Generic Local Computer Upload Route (Images & Videos)
const upload_1 = require("./middlewares/upload");
app.post(['/api/upload', '/api/admin/upload'], upload_1.uploadLocal.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const fileUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
});
// API Routes
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/categories', (0, cache_1.cacheMiddleware)(120), categories_routes_1.default);
app.use('/api/products', products_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/addresses', addresses_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/wishlist', wishlist_routes_1.default);
app.use('/api/banners', (0, cache_1.cacheMiddleware)(120), banners_routes_1.default);
app.use('/api/coupons', coupons_routes_1.default);
app.use('/api/rfq', rfq_routes_1.default);
app.use('/api/content', content_routes_1.default);
app.use('/api/search', search_routes_1.default);
app.use('/api/filters', filters_routes_1.default);
app.use('/api/account', account_routes_1.default);
app.use('/api/companies', companies_routes_1.default); // Storefront
app.use('/api/vendors', vendors_routes_1.default); // Admin / Storefront
app.use('/api/settlements', settlements_routes_1.default);
app.use('/api/logistics', logistics_routes_1.default);
app.use('/api', po_routes_1.default); // B2B and Admin POs
app.use('/api/ai', ai_routes_1.default);
app.use('/api/rentals', rentals_routes_1.default);
app.use('/api/erp', erp_routes_1.default);
app.use('/api', companies_routes_1.default);
app.use('/api', reviews_routes_1.default);
app.use('/api/services', services_routes_1.default);
app.use('/api/wallet', wallet_routes_1.default);
app.use('/api/rewards', rewards_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/blogs', blogs_routes_1.default);
app.use('/api/deals', deals_routes_1.default);
app.use('/api/buying-guides', buying_guides_routes_1.default);
app.use('/api/support', support_routes_1.default);
app.use('/api/faq', faq_routes_1.default);
app.use('/api/contact', contact_routes_1.default);
app.use('/api/credit', credit_lines_routes_1.default);
app.use('/api/brands', brands_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/returns', returns_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/health', health_routes_1.default);
app.use('/api/admin', audit_routes_1.default);
// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'HINCHI API is healthy' });
});
// Global Error Handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map