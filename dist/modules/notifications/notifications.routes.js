"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("./notifications.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, notifications_controller_1.getNotifications);
router.patch('/mark-all-read', auth_1.requireAuth, notifications_controller_1.markAllAsRead);
router.patch('/:id/read', auth_1.requireAuth, notifications_controller_1.markAsRead);
router.get('/settings', auth_1.requireAuth, notifications_controller_1.getNotificationSettings);
router.put('/settings', auth_1.requireAuth, notifications_controller_1.updateNotificationSettings);
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map