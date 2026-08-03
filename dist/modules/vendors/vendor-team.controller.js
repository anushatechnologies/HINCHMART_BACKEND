"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.createRole = exports.inviteTeamMember = exports.getTeamMembers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const getTeamMembers = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const team = await prisma.vendorUser.findMany({
            where: { vendorId },
            include: {
                role: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const roles = await prisma.vendorRole.findMany({
            where: { vendorId }
        });
        res.status(200).json({ success: true, data: { team, roles } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch team', error: error.message });
    }
};
exports.getTeamMembers = getTeamMembers;
const inviteTeamMember = async (req, res) => {
    try {
        const { vendorId, name, email, roleId, password } = req.body;
        if (!vendorId || !name || !email || !password) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        const existingUser = await prisma.vendorUser.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already exists' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newUser = await prisma.vendorUser.create({
            data: {
                vendorId: parseInt(vendorId, 10),
                name,
                email,
                passwordHash,
                roleId: roleId ? parseInt(roleId, 10) : null
            },
            include: {
                role: true
            }
        });
        res.status(201).json({ success: true, message: 'Team member added', data: newUser });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to invite team member', error: error.message });
    }
};
exports.inviteTeamMember = inviteTeamMember;
const createRole = async (req, res) => {
    try {
        const { vendorId, name, permissions } = req.body;
        if (!vendorId || !name) {
            res.status(400).json({ success: false, message: 'vendorId and name are required' });
            return;
        }
        const role = await prisma.vendorRole.create({
            data: {
                vendorId: parseInt(vendorId, 10),
                name,
                permissions: permissions || []
            }
        });
        res.status(201).json({ success: true, message: 'Role created', data: role });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create role', error: error.message });
    }
};
exports.createRole = createRole;
const getAuditLogs = async (req, res) => {
    try {
        const vendorId = parseInt(req.query.vendorId, 10);
        if (isNaN(vendorId)) {
            res.status(400).json({ success: false, message: 'vendorId is required' });
            return;
        }
        const activityLogs = await prisma.vendorActivityLog.findMany({
            where: { vendorId },
            include: { vendorUser: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        const loginHistory = await prisma.vendorLoginHistory.findMany({
            where: { vendorId },
            include: { vendorUser: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.status(200).json({ success: true, data: { activityLogs, loginHistory } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch logs', error: error.message });
    }
};
exports.getAuditLogs = getAuditLogs;
//# sourceMappingURL=vendor-team.controller.js.map