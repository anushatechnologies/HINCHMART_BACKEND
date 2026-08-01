import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationSettings,
  updateNotificationSettings,
} from './notifications.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.patch('/mark-all-read', requireAuth, markAllAsRead);
router.patch('/:id/read', requireAuth, markAsRead);
router.get('/settings', requireAuth, getNotificationSettings);
router.put('/settings', requireAuth, updateNotificationSettings);

export default router;
