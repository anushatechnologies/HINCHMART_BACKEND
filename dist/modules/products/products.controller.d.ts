import { Request, Response } from 'express';
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductBySlug: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createProduct: (req: Request, res: Response) => Promise<void>;
export declare const updateProduct: (req: any, res: any) => Promise<void>;
//# sourceMappingURL=products.controller.d.ts.map