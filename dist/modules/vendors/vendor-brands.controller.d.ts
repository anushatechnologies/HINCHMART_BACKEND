import { Request, Response } from 'express';
/**
 * Get all brand requests and access items for a vendor
 * GET /api/vendors/:id/brands
 */
export declare const getVendorBrands: (req: Request, res: Response) => Promise<void>;
/**
 * Submit a new brand request (Option B - Brand Owner)
 * POST /api/vendors/:id/brands/request-new
 */
export declare const requestNewBrand: (req: Request, res: Response) => Promise<void>;
/**
 * Submit a request to access an existing brand (Option A & C - Distributor/Dealer)
 * POST /api/vendors/:id/brands/request-access
 */
export declare const requestBrandAccess: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=vendor-brands.controller.d.ts.map