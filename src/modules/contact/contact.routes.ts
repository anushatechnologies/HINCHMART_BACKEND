import { Router } from 'express';
import { submitInquiry, getInquiries, updateInquiryStatus } from './contact.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.post('/', submitInquiry);
router.get('/admin', requireAuth, getInquiries);
router.patch('/admin/:id/status', requireAuth, updateInquiryStatus);

export default router;
