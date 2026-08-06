import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'hinchmart_access_secret_2024!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hinchmart_refresh_secret_2024!';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface TokenPayload {
  id: number;
  email?: string;
  role: string;
  vendorId?: number;
}

/** Generate a short-lived access token (15 min) */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/** Generate a random opaque refresh token (UUID) */
export function generateRefreshTokenString(): string {
  return uuidv4() + '-' + uuidv4(); // double UUID for extra entropy
}

/** Store a refresh token in the database */
export async function saveRefreshToken(
  token: string,
  userType: 'USER' | 'VENDOR' | 'ADMIN',
  ids: { userId?: number; vendorId?: number; adminId?: number }
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await (prisma as any).refreshToken.create({
    data: {
      token,
      userType,
      userId: ids.userId ?? null,
      vendorId: ids.vendorId ?? null,
      adminId: ids.adminId ?? null,
      expiresAt,
      revoked: false
    }
  });
}

/** Validate refresh token, rotate it, return new token pair */
export async function rotateRefreshToken(
  oldToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const record = await (prisma as any).refreshToken.findUnique({
    where: { token: oldToken }
  });

  if (!record || record.revoked || record.expiresAt < new Date()) {
    return null; // Invalid, revoked, or expired
  }

  // Revoke the old token (rotation)
  await (prisma as any).refreshToken.update({
    where: { id: record.id },
    data: { revoked: true }
  });

  // Build payload from stored record
  let payload: TokenPayload;
  if (record.userType === 'VENDOR') {
    payload = { id: record.vendorId!, role: 'VENDOR' };
  } else if (record.userType === 'ADMIN') {
    payload = { id: record.adminId!, role: 'ADMIN' };
  } else {
    payload = { id: record.userId!, role: 'USER' };
  }

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshTokenString();

  // Save the new refresh token
  await saveRefreshToken(newRefreshToken, record.userType as 'USER' | 'VENDOR' | 'ADMIN', {
    userId: record.userId,
    vendorId: record.vendorId,
    adminId: record.adminId
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/** Revoke a refresh token (logout) */
export async function revokeRefreshToken(token: string): Promise<void> {
  await (prisma as any).refreshToken.updateMany({
    where: { token },
    data: { revoked: true }
  });
}

/** Revoke ALL refresh tokens for a user/vendor/admin (logout all devices) */
export async function revokeAllTokensFor(
  userType: 'USER' | 'VENDOR' | 'ADMIN',
  id: number
): Promise<void> {
  const where: any = { userType, revoked: false };
  if (userType === 'VENDOR') where.vendorId = id;
  else if (userType === 'ADMIN') where.adminId = id;
  else where.userId = id;

  await (prisma as any).refreshToken.updateMany({ where, data: { revoked: true } });
}

export { ACCESS_SECRET };
