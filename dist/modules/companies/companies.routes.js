"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companies_controller_1 = require("./companies.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Storefront routes
router.post('/my-company/register', auth_1.requireAuth, companies_controller_1.registerCompany);
router.get('/my-company', auth_1.requireAuth, companies_controller_1.getMyCompany);
router.post('/my-company/users', auth_1.requireAuth, companies_controller_1.assignUserToCompany);
// Admin routes (mounted at /api/admin/companies)
router.post('/admin/companies', auth_1.requireAuth, companies_controller_1.createCompany);
router.get('/admin/companies', auth_1.requireAuth, companies_controller_1.getAllCompaniesAdmin);
router.put('/admin/companies/:id', auth_1.requireAuth, companies_controller_1.updateCompanyAdmin);
router.delete('/admin/companies/:id', auth_1.requireAuth, companies_controller_1.deleteCompanyAdmin);
// Admin Contract routes
router.get('/admin/companies/:id/contracts', auth_1.requireAuth, companies_controller_1.getCompanyContracts);
router.post('/admin/companies/:id/contracts', auth_1.requireAuth, companies_controller_1.addCompanyContract);
router.delete('/admin/companies/:id/contracts/:contractId', auth_1.requireAuth, companies_controller_1.deleteCompanyContract);
exports.default = router;
//# sourceMappingURL=companies.routes.js.map