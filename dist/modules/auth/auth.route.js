"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
// Route to verify Firebase token from frontend and issue a backend session token
router.post('/verify-firebase', auth_controller_1.verifyFirebaseToken);
exports.default = router;
//# sourceMappingURL=auth.route.js.map