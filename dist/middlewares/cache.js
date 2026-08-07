"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheMiddleware = void 0;
const memoryCache = new Map();
/**
 * In-memory TTL Response Caching Middleware
 * @param ttlSeconds Time to live in seconds (default: 60s)
 */
const cacheMiddleware = (ttlSeconds = 60) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        const key = req.originalUrl || req.url;
        const cached = memoryCache.get(key);
        if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached.body);
        }
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            memoryCache.set(key, { body, timestamp: Date.now() });
            res.setHeader('X-Cache', 'MISS');
            return originalJson(body);
        };
        next();
    };
};
exports.cacheMiddleware = cacheMiddleware;
const clearCache = () => {
    memoryCache.clear();
};
exports.clearCache = clearCache;
//# sourceMappingURL=cache.js.map