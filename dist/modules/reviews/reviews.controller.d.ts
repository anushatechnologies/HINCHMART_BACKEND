import { Request, Response } from 'express';
export declare const getMyReviews: (req: Request, res: Response) => Promise<void>;
export declare const getProductReviews: (req: Request, res: Response) => Promise<void>;
export declare const createReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllReviewsAdmin: (req: Request, res: Response) => Promise<void>;
export declare const updateReviewStatusAdmin: (req: Request, res: Response) => Promise<void>;
export declare const deleteReviewAdmin: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=reviews.controller.d.ts.map