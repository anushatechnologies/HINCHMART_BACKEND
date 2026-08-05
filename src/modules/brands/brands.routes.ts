import { Router } from 'express';
import { getActiveBrands } from './brands.controller';

const router = Router();

router.get('/', getActiveBrands);

export default router;
