import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from './products.controller';
import { upload } from '../../middlewares/upload';
import { optionalAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', optionalAuth, getProducts);
router.get('/:slug', optionalAuth, getProductBySlug);
router.post('/', optionalAuth, upload.array('images', 5), createProduct);
router.patch('/:id', optionalAuth, updateProduct);
router.delete('/:id', optionalAuth, deleteProduct);

export default router;
