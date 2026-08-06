import { Request, Response } from 'express';
import { rotateRefreshToken, revokeRefreshToken } from '../../utils/tokenUtils';

/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * Returns: { accessToken, refreshToken } or 401
 */
export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    const tokens = await rotateRefreshToken(refreshToken);

    if (!tokens) {
      res.status(401).json({
        success: false,
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Refresh token is expired, revoked, or invalid. Please log in again.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      message: 'Tokens refreshed successfully'
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Failed to refresh token', error: error.message });
  }
};

/**
 * POST /api/auth/logout
 * Body: { refreshToken: string }
 * Revokes the refresh token in DB
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};
