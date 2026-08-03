import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock API for GST Verification
export const verifyGst = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error verifying GST:', error);
    res.status(500).json({ success: false, message: 'GST Verification Failed' });
  }
};

// Mock API for PAN Verification
export const verifyPan = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error verifying PAN:', error);
    res.status(500).json({ success: false, message: 'PAN Verification Failed' });
  }
};

// Mock API for Bank Penny Drop
export const verifyBankAccount = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error verifying Bank Account:', error);
    res.status(500).json({ success: false, message: 'Bank Verification Failed' });
  }
};

// Final KYC Submission
export const submitKyc = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ success: false, message: 'KYC Submission Failed' });
  }
};
