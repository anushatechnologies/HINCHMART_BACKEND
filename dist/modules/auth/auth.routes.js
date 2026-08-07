"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const otp_controller_1 = require("./otp.controller");
const refresh_controller_1 = require("./refresh.controller");
const router = (0, express_1.Router)();
// Firebase Auth Verification (OTP/Social)
router.post('/verify-firebase', auth_controller_1.verifyFirebaseToken);
// Custom OTP (Email/Phone)
router.post('/send-otp', otp_controller_1.sendOtp);
router.post('/verify-otp', otp_controller_1.verifyOtp);
// Standard Registration & Login
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
// Token Management
router.post('/refresh', refresh_controller_1.refreshTokens); // GET new access + refresh tokens
router.post('/logout', refresh_controller_1.logout); // Revoke refresh token
exports.default = router;
//# sourceMappingURL=auth.routes.js.map