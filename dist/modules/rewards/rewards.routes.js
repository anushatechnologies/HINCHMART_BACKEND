"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rewards_controller_1 = require("./rewards.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, rewards_controller_1.getRewards);
router.post('/earn', auth_1.requireAuth, rewards_controller_1.earnPoints);
exports.default = router;
//# sourceMappingURL=rewards.routes.js.map