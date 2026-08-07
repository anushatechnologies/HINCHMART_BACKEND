"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshTokens = void 0;
const tokenUtils_1 = require("../../utils/tokenUtils");
/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * Returns: { accessToken, refreshToken } or 401
 */
const refreshTokens = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, message: 'Refresh token is required' });
            return;
        }
        const tokens = await (0, tokenUtils_1.rotateRefreshToken)(refreshToken);
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
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ success: false, message: 'Failed to refresh token', error: error.message });
    }
};
exports.refreshTokens = refreshTokens;
/**
 * POST /api/auth/logout
 * Body: { refreshToken: string }
 * Revokes the refresh token in DB
 */
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await (0, tokenUtils_1.revokeRefreshToken)(refreshToken);
        }
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
    }
};
exports.logout = logout;
//# sourceMappingURL=refresh.controller.js.map