"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOnboardingProgress = exports.resetPassword = exports.forgotPassword = exports.verifyOtp = exports.updateVendorProfile = exports.deleteVendor = exports.updateVendorKycStatus = exports.updateVendorStatus = exports.loginVendor = exports.registerVendor = exports.createVendor = exports.getVendors = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_1 = require("../../utils/firebase");
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'secret123';
const getVendors = async (req, res) => {
    try {
        const vendors = await prisma_1.default.vendor.findMany({
            include: {
                _count: {
                    select: { products: true, quotes: true }
                }
            },
            orderBy: { id: 'desc' }
        });
        res.status(200).json({ success: true, data: vendors });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendors', error: error.message });
    }
};
exports.getVendors = getVendors;
const createVendor = async (req, res) => {
    try {
        const { companyName, gstin, contactEmail, contactPhone, status } = req.body;
        if (!companyName || !contactEmail || !contactPhone) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash('Welcome@123', 10);
        const vendor = await prisma_1.default.vendor.create({
            data: {
                companyName,
                gstin,
                contactEmail,
                contactPhone,
                passwordHash,
                status: status || 'ACTIVE'
            }
        });
        res.status(201).json({ success: true, message: 'Vendor created successfully', data: vendor });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create vendor', error: error.message });
    }
};
exports.createVendor = createVendor;
const registerVendor = async (req, res) => {
    try {
        const { companyName, ownerName, businessType, contactEmail, contactPhone, password, gstin, panNumber, aadhaarNumber, cinNumber, firebasePhoneToken // Passed from frontend after successful Firebase Phone Auth
         } = req.body;
        if (!companyName || !contactEmail || !contactPhone || !password || !firebasePhoneToken) {
            res.status(400).json({ success: false, message: 'Missing required fields or phone token' });
            return;
        }
        // Check if vendor already exists
        const existingVendor = await prisma_1.default.vendor.findFirst({
            where: {
                OR: [
                    { contactEmail },
                    { contactPhone }
                ]
            }
        });
        if (existingVendor) {
            res.status(400).json({ success: false, message: 'Email or phone already registered' });
            return;
        }
        // ENFORCE EMAIL OTP VERIFICATION (From Database)
        const verifiedEmail = await prisma_1.default.otp.findFirst({
            where: { target: contactEmail, type: 'EMAIL', verified: true }
        });
        if (!verifiedEmail) {
            res.status(400).json({ success: false, message: 'Email must be verified via OTP' });
            return;
        }
        // ENFORCE PHONE VERIFICATION (via Firebase Token)
        try {
            const decodedToken = await firebase_1.auth.verifyIdToken(firebasePhoneToken);
            // Firebase phone numbers include the country code (+91XXXXXXXXXX)
            // Our DB might store it with or without +91. Let's do a loose inclusion check or exact match
            if (!decodedToken.phone_number || !decodedToken.phone_number.includes(contactPhone)) {
                res.status(400).json({ success: false, message: 'Firebase token phone number does not match registered phone number' });
                return;
            }
        }
        catch (firebaseError) {
            res.status(401).json({ success: false, message: 'Invalid or expired Firebase phone token', error: firebaseError.message });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const vendor = await prisma_1.default.vendor.create({
            data: {
                companyName,
                ownerName,
                businessType: businessType || 'RETAILER',
                contactEmail,
                contactPhone,
                passwordHash,
                gstin,
                panNumber,
                aadhaarNumber,
                cinNumber,
                status: 'PENDING',
                kycStatus: 'PENDING'
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: vendor.id, email: vendor.contactEmail, role: 'VENDOR' }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'Seller registration successful',
            data: vendor,
            token
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};
exports.registerVendor = registerVendor;
const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const vendor = await prisma_1.default.vendor.findUnique({
            where: { contactEmail: email }
        });
        if (!vendor || !vendor.passwordHash) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, vendor.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: vendor.id, email: vendor.contactEmail, role: 'VENDOR' }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            data: vendor
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};
exports.loginVendor = loginVendor;
const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ success: false, message: 'Status is required' });
            return;
        }
        const vendor = await prisma_1.default.vendor.update({
            where: { id: parseInt(id) },
            data: { status },
        });
        res.json({ success: true, message: 'Vendor status updated successfully', data: vendor });
    }
    catch (error) {
        console.error('Error updating vendor status:', error);
        res.status(500).json({ success: false, message: 'Failed to update vendor status', error: error.message });
    }
};
exports.updateVendorStatus = updateVendorStatus;
const updateVendorKycStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { kycStatus, kycRejectionReason } = req.body;
        const vendor = await prisma_1.default.vendor.update({
            where: { id: parseInt(id) },
            data: { kycStatus, kycRejectionReason },
        });
        res.json({ success: true, message: 'Vendor KYC status updated successfully', data: vendor });
    }
    catch (error) {
        console.error('Error updating vendor KYC status:', error);
        res.status(500).json({ success: false, message: 'Failed to update vendor KYC status', error: error.message });
    }
};
exports.updateVendorKycStatus = updateVendorKycStatus;
const deleteVendor = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await prisma_1.default.vendor.delete({
            where: { id }
        });
        res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete vendor', error: error.message });
    }
};
exports.deleteVendor = deleteVendor;
const updateVendorProfile = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { companyName, ownerName, contactPhone, logoUrl, bannerUrl } = req.body;
        const vendor = await prisma_1.default.vendor.update({
            where: { id },
            data: {
                ...(companyName && { companyName }),
                ...(ownerName && { ownerName }),
                ...(contactPhone && { contactPhone }),
                ...(logoUrl !== undefined && { logoUrl }),
                ...(bannerUrl !== undefined && { bannerUrl })
            }
        });
        // Don't send password hash back
        const { passwordHash, ...vendorData } = vendor;
        res.status(200).json({ success: true, message: 'Profile updated successfully', data: vendorData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
};
exports.updateVendorProfile = updateVendorProfile;
// ================= MODULE 1 ADVANCED AUTH ================= //
const verifyOtp = async (req, res) => {
    try {
        const { contactPhone, contactEmail, otp } = req.body;
        if ((!contactPhone && !contactEmail) || !otp) {
            res.status(400).json({ success: false, message: 'Contact info and OTP are required' });
            return;
        }
        // MOCK VERIFICATION LOGIC: For MVP, assume '123456' is always valid
        if (otp !== '123456') {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
            return;
        }
        res.status(200).json({ success: true, message: 'OTP Verified successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
    }
};
exports.verifyOtp = verifyOtp;
const forgotPassword = async (req, res) => {
    try {
        const { contactEmail } = req.body;
        if (!contactEmail) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }
        const vendor = await prisma_1.default.vendor.findUnique({ where: { contactEmail } });
        if (!vendor) {
            res.status(404).json({ success: false, message: 'Vendor not found' });
            return;
        }
        // MOCK: In production, generate a real secure JWT token and email it
        const resetToken = 'mock-reset-token-123';
        res.status(200).json({
            success: true,
            message: 'Password reset link sent to email',
            token: resetToken // Returning it just for MVP testing purposes
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, contactEmail } = req.body;
        if (!token || !newPassword || !contactEmail) {
            res.status(400).json({ success: false, message: 'Token, email, and new password are required' });
            return;
        }
        if (token !== 'mock-reset-token-123') {
            res.status(400).json({ success: false, message: 'Invalid or expired token' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(newPassword, salt);
        await prisma_1.default.vendor.update({
            where: { contactEmail },
            data: { passwordHash }
        });
        res.status(200).json({ success: true, message: 'Password reset successfully. You can now login.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
    }
};
exports.resetPassword = resetPassword;
const updateOnboardingProgress = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { companyName, ownerName, businessType, gstin, panNumber, aadhaarNumber, cinNumber, bankAccountNumber, ifscCode, bankName, pickupAddress, businessDocUrl, onboardingStep, targetAudiences, serviceCities, primaryCategories } = req.body;
        const vendor = await prisma_1.default.vendor.update({
            where: { id },
            data: {
                ...(companyName && { companyName }),
                ...(ownerName && { ownerName }),
                ...(businessType && { businessType }),
                ...(gstin && { gstin }),
                ...(panNumber && { panNumber }),
                ...(aadhaarNumber && { aadhaarNumber }),
                ...(cinNumber && { cinNumber }),
                ...(bankAccountNumber && { bankAccountNumber }),
                ...(ifscCode && { ifscCode }),
                ...(bankName && { bankName }),
                ...(pickupAddress && { pickupAddress }),
                ...(businessDocUrl && { businessDocUrl }),
                ...(onboardingStep && { onboardingStep }),
                ...(targetAudiences && { targetAudiences }),
                ...(serviceCities && { serviceCities }),
                ...(primaryCategories && { primaryCategories })
            }
        });
        const { passwordHash, ...vendorData } = vendor;
        res.status(200).json({ success: true, message: 'Onboarding progress saved', data: vendorData });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save onboarding progress', error: error.message });
    }
};
exports.updateOnboardingProgress = updateOnboardingProgress;
//# sourceMappingURL=vendors.controller.js.map