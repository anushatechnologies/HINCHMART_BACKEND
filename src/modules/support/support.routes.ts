import { Router } from 'express';
import {
  createTicket, getMyTickets, replyToTicket,
  getAllTickets, updateTicketStatus, agentReplyToTicket
} from './support.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Customer
router.post('/', createTicket); // can be unauthenticated
router.get('/my-tickets', requireAuth, getMyTickets);
router.post('/:id/reply', requireAuth, replyToTicket);

// Admin
router.get('/admin/all', requireAuth, getAllTickets);
router.patch('/admin/:id/status', requireAuth, updateTicketStatus);
router.post('/admin/:id/reply', requireAuth, agentReplyToTicket);

export default router;
