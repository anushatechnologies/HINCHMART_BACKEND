import { Router } from 'express';
import { verifyFirebaseToken } from './auth.controller';
import { sendOtp, verifyOtp } from './otp.controller';

const router = Router();

// Firebase Auth Verification (OTP/Social)
router.post('/verify-firebase', verifyFirebaseToken);

// Custom OTP (Email/Phone)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
