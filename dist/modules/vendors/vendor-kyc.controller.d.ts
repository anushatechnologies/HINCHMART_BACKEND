import { Request, Response } from 'express';
export declare const verifyGst: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyPan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyBankAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const submitKyc: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=vendor-kyc.controller.d.ts.map