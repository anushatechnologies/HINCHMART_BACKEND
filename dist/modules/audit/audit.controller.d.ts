import { Request, Response } from 'express';
export declare const getAuditLogs: (req: Request, res: Response) => Promise<void>;
export declare const recordAuditEvent: (action: string, category: 'AUTH' | 'ORDER' | 'SYSTEM' | 'VENDOR' | 'SECURITY', performedBy: string, ipAddress: string, details?: any) => void;
//# sourceMappingURL=audit.controller.d.ts.map