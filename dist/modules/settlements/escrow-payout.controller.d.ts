import { Request, Response } from 'express';
/**
 * Escrow Ledger - Get Vendor's Escrow Holds
 * GET /api/settlements/escrow
 */
export declare const getEscrowLedger: (req: Request, res: Response) => Promise<void>;
/**
 * Release Eligible Escrow Holds (Admin)
 * POST /api/admin/escrow/release
 */
export declare const releaseEligibleEscrow: (req: Request, res: Response) => Promise<void>;
/**
 * Generate TDS/TCS Report (Admin)
 * GET /api/admin/tax/tds-report
 */
export declare const generateTdsReport: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=escrow-payout.controller.d.ts.map