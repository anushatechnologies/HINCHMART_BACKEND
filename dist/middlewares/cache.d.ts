import { Request, Response, NextFunction } from 'express';
/**
 * In-memory TTL Response Caching Middleware
 * @param ttlSeconds Time to live in seconds (default: 60s)
 */
export declare const cacheMiddleware: (ttlSeconds?: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const clearCache: () => void;
//# sourceMappingURL=cache.d.ts.map