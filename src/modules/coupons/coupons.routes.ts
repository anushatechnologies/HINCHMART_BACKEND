import { Router } from 'express';
import { getCoupons, createCoupon, validateCoupon, deleteCoupon } from './coupons.controller';

const router = Router();

router.get('/', getCoupons);
router.post('/validate', validateCoupon);
// In a real app, POST and DELETE should be protected by Admin Middleware
router.post('/', createCoupon);
router.delete('/:id', deleteCoupon);

export default router;
