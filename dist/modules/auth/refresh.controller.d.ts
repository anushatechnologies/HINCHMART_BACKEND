import { Request, Response } from 'express';
/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * Returns: { accessToken, refreshToken } or 401
 */
export declare const refreshTokens: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/auth/logout
 * Body: { refreshToken: string }
 * Revokes the refresh token in DB
 */
export declare const logout: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=refresh.controller.d.ts.map