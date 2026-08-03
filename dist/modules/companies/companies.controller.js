"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompanyContract = exports.addCompanyContract = exports.getCompanyContracts = exports.assignUserToCompany = exports.getMyCompany = exports.registerCompany = exports.updateCompanyAdmin = exports.getAllCompaniesAdmin = exports.createCompany = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── ADMIN: Create a new company ─────────────────────────────────────────────
const createCompany = async (req, res) => {
    try {
        const { name, gstin, creditLimit } = req.body;
        // Check if company with GSTIN already exists
        if (gstin) {
            const existing = await prisma_1.default.company.findUnique({ where: { gstin } });
            if (existing)
                return res.status(400).json({ success: false, message: 'Company with this GSTIN already exists.' });
        }
        const company = await prisma_1.default.company.create({
            data: {
                name,
                gstin,
                creditLimit: parseFloat(creditLimit) || 0,
                availableCredit: parseFloat(creditLimit) || 0, // initially full credit
            }
        });
        res.status(201).json({ success: true, data: company, message: 'Company created successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCompany = createCompany;
// ─── ADMIN: Get all companies ────────────────────────────────────────────────
const getAllCompaniesAdmin = async (req, res) => {
    try {
        const companies = await prisma_1.default.company.findMany({
            include: {
                _count: { select: { users: true, orders: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: companies });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllCompaniesAdmin = getAllCompaniesAdmin;
// ─── ADMIN: Update company credit limit ──────────────────────────────────────
const updateCompanyAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { creditLimit, isActive } = req.body;
        const company = await prisma_1.default.company.findUnique({ where: { id: parseInt(id) } });
        if (!company)
            return res.status(404).json({ success: false, message: 'Company not found' });
        // Calculate new available credit based on difference
        let newAvailableCredit = Number(company.availableCredit);
        if (creditLimit !== undefined) {
            const diff = parseFloat(creditLimit) - Number(company.creditLimit);
            newAvailableCredit = newAvailableCredit + diff;
        }
        const updated = await prisma_1.default.company.update({
            where: { id: parseInt(id) },
            data: {
                ...(creditLimit !== undefined && { creditLimit: parseFloat(creditLimit) }),
                ...(creditLimit !== undefined && { availableCredit: newAvailableCredit }),
                ...(isActive !== undefined && { isActive })
            }
        });
        res.json({ success: true, data: updated, message: 'Company updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCompanyAdmin = updateCompanyAdmin;
// ─── STOREFRONT: Register a new company and link to user ────────────────────
const registerCompany = async (req, res) => {
    try {
        const { name, gstin } = req.body;
        const userId = req.user.id;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Company name is required.' });
        }
        if (gstin) {
            const existing = await prisma_1.default.company.findUnique({ where: { gstin } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Company with this GSTIN already exists.' });
            }
        }
        const company = await prisma_1.default.company.create({
            data: {
                name,
                gstin,
                creditLimit: 50000, // Default credit limit for new signups
                availableCredit: 50000,
            }
        });
        // Update the requesting user to be linked to this company as ADMIN
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                companyId: company.id,
                b2bRole: 'ADMIN'
            }
        });
        res.status(201).json({ success: true, data: company, message: 'Company registered successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.registerCompany = registerCompany;
// ─── STOREFRONT: Get my company details ──────────────────────────────────────
const getMyCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId }, include: { company: { include: { users: { select: { id: true, name: true, email: true, b2bRole: true } } } } } });
        if (!user?.company) {
            return res.status(404).json({ success: false, message: 'You are not assigned to any corporate account.' });
        }
        res.json({ success: true, data: user.company, role: user.b2bRole });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyCompany = getMyCompany;
// ─── STOREFRONT (MANAGER): Assign user to company ────────────────────────────
const assignUserToCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserEmail, role } = req.body; // role: BUYER or MANAGER
        // Verify requesting user is MANAGER or ADMIN of a company
        const manager = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!manager?.companyId || (manager.b2bRole !== 'MANAGER' && manager.b2bRole !== 'ADMIN')) {
            return res.status(403).json({ success: false, message: 'Unauthorized. You must be a company manager.' });
        }
        const targetUser = await prisma_1.default.user.findUnique({ where: { email: targetUserEmail } });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found. They must register first.' });
        }
        await prisma_1.default.user.update({
            where: { id: targetUser.id },
            data: {
                companyId: manager.companyId,
                b2bRole: role || 'BUYER'
            }
        });
        res.json({ success: true, message: 'User added to company successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.assignUserToCompany = assignUserToCompany;
// ─── ADMIN: Get Company Contracts ────────────────────────────────────────────
const getCompanyContracts = async (req, res) => {
    try {
        const { id } = req.params;
        const contracts = await prisma_1.default.companyContract.findMany({
            where: { companyId: parseInt(id) },
            include: {
                product: { select: { name: true, sku: true, basePrice: true } }
            }
        });
        res.json({ success: true, data: contracts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCompanyContracts = getCompanyContracts;
// ─── ADMIN: Add Company Contract ─────────────────────────────────────────────
const addCompanyContract = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId, customPrice } = req.body;
        const contract = await prisma_1.default.companyContract.upsert({
            where: {
                companyId_productId: {
                    companyId: parseInt(id),
                    productId: parseInt(productId)
                }
            },
            update: {
                customPrice: parseFloat(customPrice),
                isActive: true
            },
            create: {
                companyId: parseInt(id),
                productId: parseInt(productId),
                customPrice: parseFloat(customPrice)
            }
        });
        res.json({ success: true, data: contract, message: 'Contract price added/updated.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addCompanyContract = addCompanyContract;
// ─── ADMIN: Delete Company Contract ──────────────────────────────────────────
const deleteCompanyContract = async (req, res) => {
    try {
        const { id, contractId } = req.params;
        await prisma_1.default.companyContract.delete({
            where: { id: parseInt(contractId) }
        });
        res.json({ success: true, message: 'Contract removed.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCompanyContract = deleteCompanyContract;
//# sourceMappingURL=companies.controller.js.map