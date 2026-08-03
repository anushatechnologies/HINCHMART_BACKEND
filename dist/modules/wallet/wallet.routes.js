"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("./wallet.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, wallet_controller_1.getWallet);
router.post('/add-funds', auth_1.requireAuth, wallet_controller_1.addFunds);
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map