"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_controller_1 = require("./services.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', services_controller_1.getServices);
router.get('/:id', services_controller_1.getServiceById);
router.post('/bookings', auth_1.requireAuth, services_controller_1.createServiceBooking);
router.get('/my-bookings', auth_1.requireAuth, services_controller_1.getMyServiceBookings);
router.get('/vendor/bookings', auth_1.requireAuth, services_controller_1.getVendorServiceBookings);
router.patch('/bookings/:id/status', auth_1.requireAuth, services_controller_1.updateServiceBookingStatus);
exports.default = router;
//# sourceMappingURL=services.routes.js.map