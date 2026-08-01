import { Router } from 'express';
import { getFilters } from './filters.controller';

const router = Router();

router.get('/', getFilters);

export default router;
