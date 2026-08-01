import { Router } from 'express';
import { verifyFirebaseToken } from './auth.controller';

const router = Router();

// Route to verify Firebase token from frontend and issue a backend session token
router.post('/verify-firebase', verifyFirebaseToken);

export default router;
