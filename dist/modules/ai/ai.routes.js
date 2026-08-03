"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/chat', auth_1.requireAuth, ai_controller_1.chatWithCopilot);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map