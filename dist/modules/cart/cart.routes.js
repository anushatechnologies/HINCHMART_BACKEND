"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("./cart.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', cart_controller_1.getCart);
router.post('/items', cart_controller_1.addItem);
router.post('/sync', cart_controller_1.syncCart);
router.put('/items/:id', cart_controller_1.updateItem);
router.delete('/items/:id', cart_controller_1.removeItem);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map