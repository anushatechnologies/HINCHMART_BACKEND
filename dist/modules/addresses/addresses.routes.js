"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const addresses_controller_1 = require("./addresses.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', addresses_controller_1.getAddresses);
router.post('/', addresses_controller_1.addAddress);
router.delete('/:id', addresses_controller_1.deleteAddress);
exports.default = router;
//# sourceMappingURL=addresses.routes.js.map