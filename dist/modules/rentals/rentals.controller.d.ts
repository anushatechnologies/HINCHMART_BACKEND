import { Request, Response } from 'express';
export declare const getRentableProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createRentalRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllRentalRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateRentalStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyRentalRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=rentals.controller.d.ts.map