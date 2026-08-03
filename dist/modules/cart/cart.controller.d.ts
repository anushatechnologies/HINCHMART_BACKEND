import { Request, Response } from 'express';
export declare const getCart: (req: Request, res: Response) => Promise<void>;
export declare const addItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeItem: (req: Request, res: Response) => Promise<void>;
export declare const syncCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=cart.controller.d.ts.map