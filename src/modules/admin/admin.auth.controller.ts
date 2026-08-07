import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import {
  generateAccessToken,
  generateRefreshTokenString,
  saveRefreshToken
} from '../../utils/tokenUtils';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // 1. Try to find Admin User (Case insensitive check)
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: email },
          { email: { equals: email } }
        ]
      }
    });

    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (isMatch) {
        const accessToken = generateAccessToken({ id: admin.id, email: admin.email, role: 'ADMIN' });
        const refreshToken = generateRefreshTokenString();

        try {
          await saveRefreshToken(refreshToken, 'ADMIN', { adminId: admin.id });
        } catch (e) {
          console.warn('Failed to persist refresh token to DB:', e);
        }

        return res.json({
          success: true,
          accessToken,
          refreshToken,
          token: accessToken,
          data: { id: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' }
        });
      }
    }

    // 2. Try to find Vendor (vendors can also log in through admin panel)
    const vendor = await prisma.vendor.findFirst({
      where: { contactEmail: email }
    });

    if (vendor && vendor.passwordHash) {
      const isMatch = await bcrypt.compare(password, vendor.passwordHash);
      if (isMatch) {
        if (vendor.status !== 'ACTIVE') {
          return res.status(403).json({ success: false, message: 'Vendor account is suspended or pending approval.' });
        }

        const accessToken = generateAccessToken({ id: vendor.id, email: vendor.contactEmail, role: 'VENDOR' });
        const refreshToken = generateRefreshTokenString();

        try {
          await saveRefreshToken(refreshToken, 'VENDOR', { vendorId: vendor.id });
        } catch (e) {
          console.warn('Failed to persist vendor refresh token to DB:', e);
        }

        return res.json({
          success: true,
          accessToken,
          refreshToken,
          token: accessToken,
          data: { id: vendor.id, name: vendor.companyName, email: vendor.contactEmail, role: 'VENDOR' }
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email and password.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
