import { Router } from 'express';
import { 
  createCompany, 
  getAllCompaniesAdmin, 
  updateCompanyAdmin, 
  deleteCompanyAdmin,
  getMyCompany, 
  assignUserToCompany,
  getCompanyContracts,
  addCompanyContract,
  deleteCompanyContract,
  registerCompany
} from './companies.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Storefront routes
router.post('/my-company/register', requireAuth, registerCompany);
router.get('/my-company', requireAuth, getMyCompany);
router.post('/my-company/users', requireAuth, assignUserToCompany);

// Admin routes (mounted at /api/admin/companies)
router.post('/admin/companies', requireAuth, createCompany);
router.get('/admin/companies', requireAuth, getAllCompaniesAdmin);
router.put('/admin/companies/:id', requireAuth, updateCompanyAdmin);
router.delete('/admin/companies/:id', requireAuth, deleteCompanyAdmin);

// Admin Contract routes
router.get('/admin/companies/:id/contracts', requireAuth, getCompanyContracts);
router.post('/admin/companies/:id/contracts', requireAuth, addCompanyContract);
router.delete('/admin/companies/:id/contracts/:contractId', requireAuth, deleteCompanyContract);

export default router;
