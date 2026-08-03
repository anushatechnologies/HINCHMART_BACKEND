"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const support_controller_1 = require("./support.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Customer
router.post('/', support_controller_1.createTicket); // can be unauthenticated
router.get('/my-tickets', auth_1.requireAuth, support_controller_1.getMyTickets);
router.post('/:id/reply', auth_1.requireAuth, support_controller_1.replyToTicket);
// Admin
router.get('/admin/all', auth_1.requireAuth, support_controller_1.getAllTickets);
router.patch('/admin/:id/status', auth_1.requireAuth, support_controller_1.updateTicketStatus);
router.post('/admin/:id/reply', auth_1.requireAuth, support_controller_1.agentReplyToTicket);
exports.default = router;
//# sourceMappingURL=support.routes.js.map