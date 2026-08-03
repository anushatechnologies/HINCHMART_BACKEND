import { Request, Response } from 'express';
export declare const getServices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getServiceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createServiceBooking: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyServiceBookings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVendorServiceBookings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateServiceBookingStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=services.controller.d.ts.map