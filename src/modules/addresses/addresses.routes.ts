import { Router } from 'express';
import { getAddresses, addAddress, deleteAddress } from './addresses.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getAddresses);
router.post('/', addAddress);
router.delete('/:id', deleteAddress);

export default router;
