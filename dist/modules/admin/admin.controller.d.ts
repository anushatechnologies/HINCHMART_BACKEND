import { Request, Response } from 'express';
export declare const getDashboardStats: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<void>;
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const getCreditNotes: (req: Request, res: Response) => Promise<void>;
export declare const getDashboardChartData: (req: Request, res: Response) => Promise<void>;
export declare const triggerErpSync: (req: Request, res: Response) => Promise<void>;
export declare const getWalletTransactions: (req: Request, res: Response) => Promise<void>;
export declare const approveWalletTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSystemMetrics: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map