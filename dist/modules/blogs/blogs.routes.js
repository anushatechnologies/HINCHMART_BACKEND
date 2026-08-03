"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogs_controller_1 = require("./blogs.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Public
router.get('/', blogs_controller_1.getBlogs);
router.get('/:slug', blogs_controller_1.getBlogBySlug);
// Admin
router.get('/admin/all', auth_1.requireAuth, blogs_controller_1.getAllBlogsAdmin);
router.post('/admin', auth_1.requireAuth, blogs_controller_1.createBlog);
router.put('/admin/:id', auth_1.requireAuth, blogs_controller_1.updateBlog);
router.delete('/admin/:id', auth_1.requireAuth, blogs_controller_1.deleteBlog);
exports.default = router;
//# sourceMappingURL=blogs.routes.js.map