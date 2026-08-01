import { Router } from 'express';
import { searchProducts, getPopularSearches, searchBySku } from './search.controller';

const router = Router();

router.get('/', searchProducts);
router.get('/popular', getPopularSearches);
router.get('/sku', searchBySku);

export default router;
