import { Router } from 'express';
import { verifyFirebaseToken, register, login } from './auth.controller';
import { sendOtp, verifyOtp } from './otp.controller';
import { refreshTokens, logout } from './refresh.controller';

const router = Router();

// Firebase Auth Verification (OTP/Social)
router.post('/verify-firebase', verifyFirebaseToken);

// Custom OTP (Email/Phone)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Standard Registration & Login
router.post('/register', register);
router.post('/login', login);

// Token Management
router.post('/refresh', refreshTokens);  // GET new access + refresh tokens
router.post('/logout', logout);          // Revoke refresh token

export default router;
