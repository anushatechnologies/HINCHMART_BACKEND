"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rentals_controller_1 = require("./rentals.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', rentals_controller_1.getRentableProducts);
router.post('/request', auth_1.requireAuth, rentals_controller_1.createRentalRequest);
router.get('/my-requests', auth_1.requireAuth, rentals_controller_1.getMyRentalRequests);
router.get('/requests', auth_1.requireAuth, rentals_controller_1.getAllRentalRequests);
router.patch('/requests/:id/status', auth_1.requireAuth, rentals_controller_1.updateRentalStatus);
exports.default = router;
//# sourceMappingURL=rentals.routes.js.map