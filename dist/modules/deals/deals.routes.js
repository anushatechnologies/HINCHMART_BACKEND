"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deals_controller_1 = require("./deals.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', deals_controller_1.getActiveDeals);
router.get('/admin', auth_1.requireAuth, deals_controller_1.getAllDealsAdmin);
router.post('/admin', auth_1.requireAuth, deals_controller_1.createDeal);
router.put('/admin/:id', auth_1.requireAuth, deals_controller_1.updateDeal);
router.delete('/admin/:id', auth_1.requireAuth, deals_controller_1.deleteDeal);
exports.default = router;
//# sourceMappingURL=deals.routes.js.map