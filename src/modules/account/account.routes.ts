import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import {
  getProfile, updateProfile, changePassword,
  getDashboard, getOrderById, cancelOrder
} from './account.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/change-password', changePassword);
router.get('/orders/:orderId', getOrderById);
router.post('/orders/:orderId/cancel', cancelOrder);

export default router;
