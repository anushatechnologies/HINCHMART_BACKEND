import { Request, Response } from 'express';
export declare const getProfile: (req: Request, res: Response) => Promise<void>;
export declare const updateProfile: (req: Request, res: Response) => Promise<void>;
export declare const changePassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDashboard: (req: Request, res: Response) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=account.controller.d.ts.map