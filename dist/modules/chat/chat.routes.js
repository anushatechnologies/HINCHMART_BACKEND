"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Public / Customer
router.post('/start', chat_controller_1.startSession);
router.get('/:id', chat_controller_1.getSession);
router.post('/:id/message', chat_controller_1.sendMessage);
// Admin
router.get('/admin/all', auth_1.requireAuth, chat_controller_1.getAllSessionsAdmin);
router.post('/admin/:id/close', auth_1.requireAuth, chat_controller_1.closeSession);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map