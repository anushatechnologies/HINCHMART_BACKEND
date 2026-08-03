"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filters_controller_1 = require("./filters.controller");
const router = (0, express_1.Router)();
router.get('/', filters_controller_1.getFilters);
exports.default = router;
//# sourceMappingURL=filters.routes.js.map