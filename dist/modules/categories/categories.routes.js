"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("./categories.controller");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
router.get('/', categories_controller_1.getCategories);
router.post('/', upload_1.upload.single('image'), categories_controller_1.createCategory);
router.put('/:id', upload_1.upload.single('image'), categories_controller_1.updateCategory);
router.delete('/:id', categories_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map