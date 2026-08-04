import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth as firebaseAuth } from '../../utils/firebase';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'secret123';

export const getVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: {
          select: { products: true, quotes: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.status(200).json({ success: true, data: vendors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendors', error: error.message });
  }
};

export const createVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, gstin, contactEmail, contactPhone, status } = req.body;
    
    if (!companyName || !contactEmail || !contactPhone) {
       res.status(400).json({ success: false, message: 'Missing required fields' });
       return;
    }

    const passwordHash = await bcrypt.hash('Welcome@123', 10);

    const vendor = await prisma.vendor.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create vendor', error: error.message });
  }
};

export const registerVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      companyName, 
      ownerName, 
      businessType, 
      contactEmail, 
      contactPhone, 
      password,
      gstin, 
      panNumber,
      aadhaarNumber,
      cinNumber,
      firebasePhoneToken // Passed from frontend after successful Firebase Phone Auth
    } = req.body;

    if (!companyName || !contactEmail || !contactPhone || !password || !firebasePhoneToken) {
      res.status(400).json({ success: false, message: 'Missing required fields or phone token' });
      return;
    }

    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findFirst({
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
    const verifiedEmail = await prisma.otp.findFirst({
      where: { target: contactEmail, type: 'EMAIL', verified: true }
    });

    if (!verifiedEmail) {
      res.status(400).json({ success: false, message: 'Email must be verified via OTP' });
      return;
    }

    // ENFORCE PHONE VERIFICATION (via Firebase Token)
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(firebasePhoneToken);
      // Firebase phone numbers include the country code (+91XXXXXXXXXX)
      // Our DB might store it with or without +91. Let's do a loose inclusion check or exact match
      if (!decodedToken.phone_number || !decodedToken.phone_number.includes(contactPhone)) {
        res.status(400).json({ success: false, message: 'Firebase token phone number does not match registered phone number' });
        return;
      }
    } catch (firebaseError: any) {
      res.status(401).json({ success: false, message: 'Invalid or expired Firebase phone token', error: firebaseError.message });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const vendor = await prisma.vendor.create({
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

    const token = jwt.sign(
      { id: vendor.id, email: vendor.contactEmail, role: 'VENDOR' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Seller registration successful', 
      data: vendor,
      token
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

export const loginVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const vendor = await prisma.vendor.findUnique({
      where: { contactEmail: email }
    });

    if (!vendor || !vendor.passwordHash) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: vendor.id, email: vendor.contactEmail, role: 'VENDOR' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      data: vendor 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const updateVendorStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }
    
    const vendor = await prisma.vendor.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    
    res.json({ success: true, message: 'Vendor status updated successfully', data: vendor });
  } catch (error: any) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({ success: false, message: 'Failed to update vendor status', error: error.message });
  }
};

export const updateVendorKycStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { kycStatus, kycRejectionReason } = req.body;
    
    const vendor = await prisma.vendor.update({
      where: { id: parseInt(id) },
      data: { kycStatus, kycRejectionReason },
    });
    
    res.json({ success: true, message: 'Vendor KYC status updated successfully', data: vendor });
  } catch (error: any) {
    console.error('Error updating vendor KYC status:', error);
    res.status(500).json({ success: false, message: 'Failed to update vendor KYC status', error: error.message });
  }
};

export const deleteVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    await prisma.vendor.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete vendor', error: error.message });
  }
};

export const updateVendorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { companyName, ownerName, contactPhone, logoUrl, bannerUrl } = req.body;

    const vendor = await prisma.vendor.update({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// ================= MODULE 1 ADVANCED AUTH ================= //

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contactEmail } = req.body;

    if (!contactEmail) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const vendor = await prisma.vendor.findUnique({ where: { contactEmail } });
    
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.vendor.update({
      where: { contactEmail },
      data: { passwordHash }
    });

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

export const updateOnboardingProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      companyName, ownerName, businessType,
      gstin, panNumber, aadhaarNumber, cinNumber,
      bankAccountNumber, ifscCode, bankName,
      pickupAddress,
      businessDocUrl,
      onboardingStep,
      targetAudiences, serviceCities, primaryCategories
    } = req.body;

    const vendor = await prisma.vendor.update({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to save onboarding progress', error: error.message });
  }
};

export const verifyFirebaseVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, name, email } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: 'Firebase token is required' });
      return;
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const { uid, phone_number, email: firebaseEmail } = decodedToken;

    if (!phone_number && !firebaseEmail) {
      res.status(400).json({ success: false, message: 'Phone number or Email is required from Firebase' });
      return;
    }

    const primaryEmail = email || firebaseEmail;
    
    let vendor = await prisma.vendor.findFirst({
      where: phone_number 
        ? { contactPhone: phone_number.replace('+91', '') } 
        : { contactEmail: primaryEmail }
    });

    if (!vendor) {
      // Create a basic vendor record for new social logins
      const passwordHash = await bcrypt.hash(uid, 10);
      vendor = await prisma.vendor.create({
        data: {
          companyName: name || `Vendor-${uid.slice(0,6)}`,
          contactPhone: phone_number ? phone_number.replace('+91', '') : `no-phone-${uid}`,
          contactEmail: primaryEmail || null,
          passwordHash: passwordHash,
          status: 'PENDING',
          kycStatus: 'PENDING'
        }
      });
    }

    const jwtToken = jwt.sign(
      { id: vendor.id, role: 'VENDOR' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Vendor authentication successful',
      token: jwtToken,
      data: {
        id: vendor.id,
        companyName: vendor.companyName,
        email: vendor.contactEmail,
        phone: vendor.contactPhone,
        status: vendor.status,
        kycStatus: vendor.kycStatus,
        onboardingStep: vendor.onboardingStep
      }
    });

  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired Firebase token' });
  }
};
