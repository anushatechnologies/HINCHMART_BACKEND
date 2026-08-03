"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitKyc = exports.verifyBankAccount = exports.verifyPan = exports.verifyGst = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Mock API for GST Verification
const verifyGst = async (req, res) => {
    try {
        const { id } = req.params;
        const { gstin } = req.body;
        if (!gstin || gstin.length !== 15) {
            return res.status(400).json({ success: false, message: 'Invalid GSTIN format' });
        }
        // Mocking 3rd Party API Delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Update DB
        const vendor = await prisma.vendor.update({
            where: { id: Number(id) },
            data: { gstin, gstVerified: true }
        });
        res.json({ success: true, message: 'GSTIN Verified Successfully', data: { gstVerified: true } });
    }
    catch (error) {
        console.error('Error verifying GST:', error);
        res.status(500).json({ success: false, message: 'GST Verification Failed' });
    }
};
exports.verifyGst = verifyGst;
// Mock API for PAN Verification
const verifyPan = async (req, res) => {
    try {
        const { id } = req.params;
        const { panNumber } = req.body;
        if (!panNumber || panNumber.length !== 10) {
            return res.status(400).json({ success: false, message: 'Invalid PAN format' });
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        const vendor = await prisma.vendor.update({
            where: { id: Number(id) },
            data: { panNumber, panVerified: true }
        });
        res.json({ success: true, message: 'PAN Verified Successfully', data: { panVerified: true } });
    }
    catch (error) {
        console.error('Error verifying PAN:', error);
        res.status(500).json({ success: false, message: 'PAN Verification Failed' });
    }
};
exports.verifyPan = verifyPan;
// Mock API for Bank Penny Drop
const verifyBankAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { bankAccountNumber, ifscCode, bankName } = req.body;
        if (!bankAccountNumber || !ifscCode) {
            return res.status(400).json({ success: false, message: 'Bank details missing' });
        }
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate bank tx
        const vendor = await prisma.vendor.update({
            where: { id: Number(id) },
            data: {
                bankAccountNumber,
                ifscCode,
                bankName,
                bankPennyDropStatus: 'VERIFIED'
            }
        });
        res.json({ success: true, message: 'Bank Account Verified Successfully', data: { bankPennyDropStatus: 'VERIFIED' } });
    }
    catch (error) {
        console.error('Error verifying Bank Account:', error);
        res.status(500).json({ success: false, message: 'Bank Verification Failed' });
    }
};
exports.verifyBankAccount = verifyBankAccount;
// Final KYC Submission
const submitKyc = async (req, res) => {
    try {
        const { id } = req.params;
        const { msmeNumber, cinNumber, aadhaarNumber, businessAddress, businessDocUrl } = req.body;
        // We can also accept an array of expiries here
        const documentExpiries = req.body.documentExpiries || {};
        const vendor = await prisma.vendor.update({
            where: { id: Number(id) },
            data: {
                msmeNumber,
                cinNumber,
                aadhaarNumber,
                businessAddress,
                businessDocUrl,
                documentExpiries: documentExpiries,
                kycStatus: 'PENDING', // Moving it back to pending for Admin review
                kycRejectionReason: null // Clear old rejection
            }
        });
        res.json({ success: true, message: 'KYC Submitted Successfully', data: vendor });
    }
    catch (error) {
        console.error('Error submitting KYC:', error);
        res.status(500).json({ success: false, message: 'KYC Submission Failed' });
    }
};
exports.submitKyc = submitKyc;
//# sourceMappingURL=vendor-kyc.controller.js.map