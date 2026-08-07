declare const ACCESS_SECRET: string;
export interface TokenPayload {
    id: number;
    email?: string;
    role: string;
    vendorId?: number;
}
/** Generate a short-lived access token (15 min) */
export declare function generateAccessToken(payload: TokenPayload): string;
/** Generate a random opaque refresh token (UUID) */
export declare function generateRefreshTokenString(): string;
/** Store a refresh token in the database */
export declare function saveRefreshToken(token: string, userType: 'USER' | 'VENDOR' | 'ADMIN', ids: {
    userId?: number;
    vendorId?: number;
    adminId?: number;
}): Promise<void>;
/** Validate refresh token, rotate it, return new token pair */
export declare function rotateRefreshToken(oldToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
} | null>;
/** Revoke a refresh token (logout) */
export declare function revokeRefreshToken(token: string): Promise<void>;
/** Revoke ALL refresh tokens for a user/vendor/admin (logout all devices) */
export declare function revokeAllTokensFor(userType: 'USER' | 'VENDOR' | 'ADMIN', id: number): Promise<void>;
export { ACCESS_SECRET };
//# sourceMappingURL=tokenUtils.d.ts.map