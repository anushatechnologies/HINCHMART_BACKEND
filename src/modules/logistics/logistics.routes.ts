import { Router } from 'express';
import { getPartners, createPartner, assignDelivery, uploadPOD, delhiveryWebhook } from './logistics.controller';
import { requireAuth } from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';

const router = Router();

router.get('/partners', requireAuth, getPartners);
router.post('/partners', requireAuth, createPartner);
router.patch('/orders/:id/assign-delivery', requireAuth, assignDelivery);
router.post('/orders/:id/pod', requireAuth, upload.single('podImage'), uploadPOD);

// Webhook for external logistics providers (e.g. Delhivery)
router.post('/webhook/delhivery', delhiveryWebhook);

export default router;
