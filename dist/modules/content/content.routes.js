"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const content_controller_1 = require("./content.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/testimonials', content_controller_1.getTestimonials);
router.get('/blogs', content_controller_1.getBlogs);
router.get('/deals', content_controller_1.getActiveDeals);
router.get('/privacy-policy', content_controller_1.getPrivacyPolicy);
// Legal & Corporate Pages
router.get('/pages/:slug', content_controller_1.getPageContent);
router.put('/pages/:slug', auth_1.requireAuth, content_controller_1.updatePageContent); // Admin only
exports.default = router;
//# sourceMappingURL=content.routes.js.map