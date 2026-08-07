"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banners_controller_1 = require("./banners.controller");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
router.get('/', banners_controller_1.getBanners);
router.post('/', upload_1.upload.single('image'), banners_controller_1.createBanner);
router.put('/:id', upload_1.upload.single('image'), banners_controller_1.updateBanner);
router.patch('/:id/toggle-status', banners_controller_1.toggleBannerStatus);
router.delete('/:id', banners_controller_1.deleteBanner);
exports.default = router;
//# sourceMappingURL=banners.routes.js.map