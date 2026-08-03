import { Request, Response } from 'express';
export declare const checkout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyOrders: (req: Request, res: Response) => Promise<void>;
export declare const getOrderInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createRazorpayOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyRazorpayPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=orders.controller.d.ts.map