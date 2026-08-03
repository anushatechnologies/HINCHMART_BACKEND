import { Request, Response, NextFunction } from 'express';
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticate: typeof requireAuth;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map