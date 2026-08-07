"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const brands_controller_1 = require("./brands.controller");
const router = (0, express_1.Router)();
router.get('/', brands_controller_1.getActiveBrands);
exports.default = router;
//# sourceMappingURL=brands.routes.js.map