import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth as firebaseAuth } from '../../utils/firebase';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshTokenString,
  saveRefreshToken
} from '../../utils/tokenUtils';

const prisma = new PrismaClient();

export const verifyFirebaseToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, name, email, referralCode } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Firebase token is required' });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const { uid, phone_number, email: firebaseEmail } = decodedToken;

    if (!phone_number && !firebaseEmail) {
      return res.status(400).json({ success: false, message: 'Phone number or Email is required from Firebase authentication' });
    }

    let user = await prisma.user.findFirst({
      where: phone_number
        ? { phone: phone_number }
        : { email: firebaseEmail }
    });

    if (!user) {
      const createData: any = {
        phone: phone_number || `no-phone-${uid}`,
        email: email || firebaseEmail || null,
        name: name || null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        referralCode: referralCode || null,
        language: 'en'
      };
      user = await prisma.user.create({ data: createData });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshTokenString();
    await saveRefreshToken(refreshToken, 'USER', { userId: user.id });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        // Legacy field for backward compatibility
        token: accessToken,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
      }
    });
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired Firebase token' });
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, password, businessName } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this phone or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const createData: any = {
      name, email: email || null, phone, password_hash,
      companyName: businessName || null, role: 'CUSTOMER', status: 'ACTIVE'
    };

    const user = await prisma.user.create({ data: createData });

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshTokenString();
    await saveRefreshToken(refreshToken, 'USER', { userId: user.id });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        accessToken,
        refreshToken,
        token: accessToken, // backward compat
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
      }
    });
  } catch (error: any) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { phone, email, password } = req.body;

    if ((!phone && !email) || !password) {
      return res.status(400).json({ success: false, message: 'Phone/email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone }
    });

    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshTokenString();
    await saveRefreshToken(refreshToken, 'USER', { userId: user.id });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        token: accessToken, // backward compat
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
