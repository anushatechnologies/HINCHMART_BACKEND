import { Request, Response } from 'express';
export declare const createTicket: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyTickets: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const replyToTicket: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllTickets: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTicketStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const agentReplyToTicket: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=support.controller.d.ts.map