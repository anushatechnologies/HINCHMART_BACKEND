"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = require("./wishlist.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', wishlist_controller_1.getWishlist);
router.post('/', wishlist_controller_1.addToWishlist);
router.post('/sync', wishlist_controller_1.syncWishlist);
router.delete('/:productId', wishlist_controller_1.removeFromWishlist);
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map