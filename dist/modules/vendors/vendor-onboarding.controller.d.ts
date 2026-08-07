import { Request, Response } from 'express';
/**
 * Save Onboarding Step (Steps 1 to 8)
 * POST /api/vendors/onboarding/step
 */
export declare const saveOnboardingStep: (req: Request, res: Response) => Promise<void>;
/**
 * Submit KYC for Admin Review
 * POST /api/vendors/onboarding/submit
 */
export declare const submitKycForReview: (req: Request, res: Response) => Promise<void>;
/**
 * Granular Section Review by Admin
 * PATCH /api/vendors/:id/granular-review
 */
export declare const granularSectionReview: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=vendor-onboarding.controller.d.ts.map