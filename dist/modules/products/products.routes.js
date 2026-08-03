"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const upload_1 = require("../../middlewares/upload");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, products_controller_1.getProducts);
router.get('/:slug', auth_1.optionalAuth, products_controller_1.getProductBySlug);
router.post('/', auth_1.optionalAuth, upload_1.upload.array('images', 5), products_controller_1.createProduct);
router.patch('/:id', auth_1.optionalAuth, products_controller_1.updateProduct);
exports.default = router;
//# sourceMappingURL=products.routes.js.map