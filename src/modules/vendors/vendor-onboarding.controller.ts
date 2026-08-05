import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

/**
 * Save Onboarding Step (Steps 1 to 8)
 * POST /api/vendors/onboarding/step
 */
export const saveOnboardingStep = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, step, payload } = req.body;

    if (!vendorId || !step) {
      res.status(400).json({ success: false, message: 'Vendor ID and step are required' });
      return;
    }

    const currentVendor = await prisma.vendor.findUnique({ where: { id: Number(vendorId) } });
    if (!currentVendor) {
      res.status(404).json({ success: false, message: 'Vendor not found' });
      return;
    }

    let updateData: any = {};
    let progress = Math.max(currentVendor.onboardingProgress, step * 12);

    switch (step) {
      case 1: // Business Information
        updateData = {
          companyName: payload.companyName || currentVendor.companyName,
          ownerName: payload.ownerName || currentVendor.ownerName,
          businessType: payload.businessType || currentVendor.businessType,
          contactEmail: payload.contactEmail || currentVendor.contactEmail,
          contactPhone: payload.contactPhone || currentVendor.contactPhone,
          businessInfoStatus: 'PENDING',
          onboardingProgress: Math.max(progress, 20)
        };
        break;

      case 2: // GST Information
        updateData = {
          gstin: payload.gstin,
          gstVerified: Boolean(payload.gstin),
          gstStatus: 'PENDING',
          onboardingProgress: Math.max(progress, 35)
        };
        break;

      case 3: // PAN Information
        updateData = {
          panNumber: payload.panNumber,
          panVerified: Boolean(payload.panNumber),
          panStatus: 'PENDING',
          onboardingProgress: Math.max(progress, 50)
        };
        break;

      case 4: // Bank Account
        updateData = {
          bankAccountNumber: payload.bankAccountNumber,
          ifscCode: payload.ifscCode,
          bankName: payload.bankName,
          cancelledChequeUrl: payload.cancelledChequeUrl,
          bankStatus: 'PENDING',
          onboardingProgress: Math.max(progress, 65)
        };
        break;

      case 5: // Warehouse & Logistics
        updateData = {
          pickupAddress: payload.pickupAddress,
          businessAddress: payload.businessAddress || payload.pickupAddress,
          warehouseStatus: 'PENDING',
          onboardingProgress: Math.max(progress, 75)
        };
        break;

      case 6: // Documents Upload
        updateData = {
          businessDocUrl: payload.businessDocUrl,
          gstCertificateUrl: payload.gstCertificateUrl,
          panCardUrl: payload.panCardUrl,
          businessRegistrationUrl: payload.businessRegistrationUrl,
          addressProofUrl: payload.addressProofUrl,
          msmeCertificateUrl: payload.msmeCertificateUrl,
          tradeLicenseUrl: payload.tradeLicenseUrl,
          msmeNumber: payload.msmeNumber,
          cinNumber: payload.cinNumber,
          docsStatus: 'PENDING',
          onboardingProgress: Math.max(progress, 85)
        };
        break;

      case 7: // Store Setup
        updateData = {
          aboutStore: payload.aboutStore,
          logoUrl: payload.logoUrl,
          bannerUrl: payload.bannerUrl,
          onboardingProgress: Math.max(progress, 95)
        };
        break;

      case 8: // Final Review & Submit
        updateData = {
          status: 'UNDER_REVIEW',
          kycStatus: 'KYC_SUBMITTED',
          onboardingProgress: 100
        };
        break;

      default:
        break;
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: Number(vendorId) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: `Onboarding step ${step} saved successfully`,
      data: updatedVendor
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit KYC for Admin Review
 * POST /api/vendors/onboarding/submit
 */
export const submitKycForReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id: Number(vendorId) },
      data: {
        status: 'UNDER_REVIEW',
        kycStatus: 'KYC_SUBMITTED',
        onboardingProgress: 100,
        businessInfoStatus: 'PENDING',
        gstStatus: 'PENDING',
        panStatus: 'PENDING',
        bankStatus: 'PENDING',
        warehouseStatus: 'PENDING',
        docsStatus: 'PENDING'
      }
    });

    res.status(200).json({
      success: true,
      message: 'KYC application submitted for admin review',
      applicationId: `HMKYC${vendor.id.toString().padStart(6, '0')}`,
      data: vendor
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Granular Section Review by Admin
 * PATCH /api/vendors/:id/granular-review
 */
export const granularSectionReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { section, status, rejectionReason } = req.body;
    // section: 'businessInfo' | 'gst' | 'pan' | 'bank' | 'warehouse' | 'docs'
    // status: 'APPROVED' | 'REJECTED'

    const vendor = await prisma.vendor.findUnique({ where: { id: Number(id) } });
    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found' });
      return;
    }

    let existingReasons: any = vendor.sectionRejectionReasons || {};
    if (status === 'REJECTED' && rejectionReason) {
      existingReasons[section] = rejectionReason;
    } else if (status === 'APPROVED') {
      delete existingReasons[section];
    }

    const fieldMap: Record<string, string> = {
      businessInfo: 'businessInfoStatus',
      gst: 'gstStatus',
      pan: 'panStatus',
      bank: 'bankStatus',
      warehouse: 'warehouseStatus',
      docs: 'docsStatus'
    };

    const targetField = fieldMap[section];
    if (!targetField) {
      res.status(400).json({ success: false, message: 'Invalid section specified' });
      return;
    }

    const updatePayload: any = {
      [targetField]: status,
      sectionRejectionReasons: existingReasons
    };

    // Calculate if all 6 sections are APPROVED
    const updatedVendorState = {
      ...vendor,
      [targetField]: status
    };

    const allApproved =
      updatedVendorState.businessInfoStatus === 'APPROVED' &&
      updatedVendorState.gstStatus === 'APPROVED' &&
      updatedVendorState.panStatus === 'APPROVED' &&
      updatedVendorState.bankStatus === 'APPROVED' &&
      updatedVendorState.warehouseStatus === 'APPROVED' &&
      updatedVendorState.docsStatus === 'APPROVED';

    const anyRejected =
      updatedVendorState.businessInfoStatus === 'REJECTED' ||
      updatedVendorState.gstStatus === 'REJECTED' ||
      updatedVendorState.panStatus === 'REJECTED' ||
      updatedVendorState.bankStatus === 'REJECTED' ||
      updatedVendorState.warehouseStatus === 'REJECTED' ||
      updatedVendorState.docsStatus === 'REJECTED';

    if (allApproved) {
      updatePayload.status = 'ACTIVE';
      updatePayload.kycStatus = 'VERIFIED';
    } else if (anyRejected) {
      updatePayload.status = 'CHANGES_REQUESTED';
      updatePayload.kycStatus = 'REJECTED';
    }

    const finalVendor = await prisma.vendor.update({
      where: { id: Number(id) },
      data: updatePayload
    });

    res.status(200).json({
      success: true,
      message: `Section ${section} updated to ${status}`,
      data: finalVendor
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
