"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("./search.controller");
const router = (0, express_1.Router)();
router.get('/', search_controller_1.searchProducts);
router.get('/popular', search_controller_1.getPopularSearches);
router.get('/sku', search_controller_1.searchBySku);
exports.default = router;
//# sourceMappingURL=search.routes.js.map