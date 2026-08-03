import { Request, Response } from 'express';
export declare const getNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAllAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNotificationSettings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateNotificationSettings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notifications.controller.d.ts.map