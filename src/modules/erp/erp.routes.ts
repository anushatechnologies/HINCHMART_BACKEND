import { Router } from 'express';
import { sapInventoryWebhook } from './erp.controller';

const router = Router();

// Note: In a real system, you'd protect this with a specific API key or signature check middleware
router.post('/webhook/sap-inventory', sapInventoryWebhook);

export default router;
