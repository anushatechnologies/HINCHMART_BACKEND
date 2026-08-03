import { Request, Response } from 'express';
export declare const startSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllSessionsAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const closeSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=chat.controller.d.ts.map