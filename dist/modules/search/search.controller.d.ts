import { Request, Response } from 'express';
export declare const searchProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPopularSearches: (req: Request, res: Response) => Promise<void>;
export declare const searchBySku: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=search.controller.d.ts.map