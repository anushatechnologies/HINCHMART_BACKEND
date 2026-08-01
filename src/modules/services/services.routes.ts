import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createServiceBooking,
  getMyServiceBookings,
  getVendorServiceBookings,
  updateServiceBookingStatus,
} from './services.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/bookings', requireAuth, createServiceBooking);
router.get('/my-bookings', requireAuth, getMyServiceBookings);
router.get('/vendor/bookings', requireAuth, getVendorServiceBookings);
router.patch('/bookings/:id/status', requireAuth, updateServiceBookingStatus);

export default router;
