import { Request, Response } from 'express';
export declare const getCoupons: (req: Request, res: Response) => Promise<void>;
export declare const createCoupon: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCoupon: (req: Request, res: Response) => Promise<void>;
export declare const validateCoupon: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=coupons.controller.d.ts.map