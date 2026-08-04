import { Request, Response } from 'express';
export declare const getVendors: (req: Request, res: Response) => Promise<void>;
export declare const createVendor: (req: Request, res: Response) => Promise<void>;
export declare const registerVendor: (req: Request, res: Response) => Promise<void>;
export declare const loginVendor: (req: Request, res: Response) => Promise<void>;
export declare const updateVendorStatus: (req: Request, res: Response) => Promise<void>;
export declare const updateVendorKycStatus: (req: Request, res: Response) => Promise<void>;
export declare const deleteVendor: (req: Request, res: Response) => Promise<void>;
export declare const updateVendorProfile: (req: Request, res: Response) => Promise<void>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
export declare const updateOnboardingProgress: (req: Request, res: Response) => Promise<void>;
export declare const verifyFirebaseVendor: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=vendors.controller.d.ts.map