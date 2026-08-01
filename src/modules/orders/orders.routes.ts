import { Router } from 'express';
import { checkout, getMyOrders, getOrderInvoice, createRazorpayOrder, verifyRazorpayPayment } from './orders.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getMyOrders);
router.post('/checkout', checkout);
router.get('/:id/invoice', getOrderInvoice);

// Razorpay Payment Routes
router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-payment', verifyRazorpayPayment);

export default router;
