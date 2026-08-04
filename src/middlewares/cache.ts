import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  body: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * In-memory TTL Response Caching Middleware
 * @param ttlSeconds Time to live in seconds (default: 60s)
 */
export const cacheMiddleware = (ttlSeconds = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
    res.json = (body: any): Response => {
      memoryCache.set(key, { body, timestamp: Date.now() });
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

export const clearCache = () => {
  memoryCache.clear();
};
