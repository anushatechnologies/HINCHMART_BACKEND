import { Request, Response } from 'express';
/**
 * Corporate Buyer applies for Trade Credit Line (Net-30 / Net-60)
 * POST /api/credit/apply
 */
export declare const applyCreditLine: (req: Request, res: Response) => Promise<void>;
/**
 * Get Buyer Credit Line & Balance
 * GET /api/credit/status?userId=123
 */
export declare const getCreditStatus: (req: Request, res: Response) => Promise<void>;
/**
 * Admin: Get List of Credit Applications
 * GET /api/admin/credit/applications
 */
export declare const getCreditLinesAdmin: (req: Request, res: Response) => Promise<void>;
/**
 * Admin: Approve / Reject / Adjust Credit Line
 * PATCH /api/admin/credit/:id/review
 */
export declare const reviewCreditLineAdmin: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=credit-lines.controller.d.ts.map