import { Request, Response } from 'express';
export declare const getPrivacyPolicy: (_req: Request, res: Response) => Promise<void>;
export declare const getTestimonials: (req: Request, res: Response) => Promise<void>;
export declare const getBlogs: (req: Request, res: Response) => Promise<void>;
export declare const getActiveDeals: (req: Request, res: Response) => Promise<void>;
export declare const getPageContent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePageContent: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=content.controller.d.ts.map