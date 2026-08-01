import { Router } from 'express';
import {
  getRentableProducts,
  createRentalRequest,
  getAllRentalRequests,
  updateRentalStatus,
  getMyRentalRequests,
} from './rentals.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', getRentableProducts);
router.post('/request', requireAuth, createRentalRequest);
router.get('/my-requests', requireAuth, getMyRentalRequests);
router.get('/requests', requireAuth, getAllRentalRequests);
router.patch('/requests/:id/status', requireAuth, updateRentalStatus);

export default router;
