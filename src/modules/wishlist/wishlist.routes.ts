import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, syncWishlist } from './wishlist.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.post('/sync', syncWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
