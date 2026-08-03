"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const otp_controller_1 = require("./otp.controller");
const router = (0, express_1.Router)();
// Firebase Auth Verification (OTP/Social)
router.post('/verify-firebase', auth_controller_1.verifyFirebaseToken);
// Custom OTP (Email/Phone)
router.post('/send-otp', otp_controller_1.sendOtp);
router.post('/verify-otp', otp_controller_1.verifyOtp);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map