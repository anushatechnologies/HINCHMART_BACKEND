import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, syncCart } from './cart.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addItem);
router.post('/sync', syncCart);
router.put('/items/:id', updateItem);
router.delete('/items/:id', removeItem);

export default router;
