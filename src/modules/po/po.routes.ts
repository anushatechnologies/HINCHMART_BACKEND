import { Router } from 'express';
import { getMyPOs, uploadPO, getAllPOs, updatePOStatus } from './po.controller';
import { requireAuth } from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';

const router = Router();

// Storefront / B2B Web routes
router.get('/b2b/po', requireAuth, getMyPOs);
router.post('/b2b/po', requireAuth, upload.single('document'), uploadPO);

// Admin routes
router.get('/admin/po', requireAuth, getAllPOs);
router.patch('/admin/po/:id/status', requireAuth, updatePOStatus);

export default router;
