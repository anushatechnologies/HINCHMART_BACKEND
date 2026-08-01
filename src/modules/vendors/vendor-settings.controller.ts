import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// --- General Settings ---
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.query.vendorId as string, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        apiKeys: { select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true } },
        webhooks: true
      }
    });

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found' });
      return;
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = parseInt(req.body.vendorId, 10);
    if (isNaN(vendorId)) {
      res.status(400).json({ success: false, message: 'vendorId is required' });
      return;
    }

    // Extract settings from body (excluding restricted fields)
    const { 
      businessName, email, phone, address, 
      shippingFee, freeShippingThreshold, gstNumber, razorpayAccountId, twoFactorEnabled 
    } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        businessName, email, phone, address,
        shippingFee: shippingFee ? parseFloat(shippingFee) : null,
        freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
        gstNumber, razorpayAccountId, 
        twoFactorEnabled: twoFactorEnabled === true
      }
    });

    res.status(200).json({ success: true, message: 'Settings updated successfully', data: vendor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- API Keys ---
export const createApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, name } = req.body;
    if (!vendorId || !name) {
      res.status(400).json({ success: false, message: 'vendorId and name are required' });
      return;
    }

    // Generate a secure random key
    const rawKey = crypto.randomBytes(32).toString('hex');
    const secretKey = `sk_live_${rawKey}`;
    const keyPrefix = secretKey.substring(0, 12) + '...';
    
    // Hash it for DB storage
    const secretHash = crypto.createHash('sha256').update(secretKey).digest('hex');

    const apiKey = await prisma.vendorApiKey.create({
      data: {
        vendorId: parseInt(vendorId, 10),
        name,
        keyPrefix,
        secretHash
      }
    });

    // ONLY return the raw secretKey once!
    res.status(201).json({ success: true, message: 'API Key generated', data: { ...apiKey, secretKey } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.vendorApiKey.delete({ where: { id: parseInt(id, 10) } });
    res.status(200).json({ success: true, message: 'API Key revoked' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Webhooks ---
export const createWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, url, events } = req.body;
    if (!vendorId || !url || !events) {
      res.status(400).json({ success: false, message: 'vendorId, url, and events are required' });
      return;
    }

    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const webhook = await prisma.vendorWebhook.create({
      data: {
        vendorId: parseInt(vendorId, 10),
        url,
        events,
        secret
      }
    });

    res.status(201).json({ success: true, message: 'Webhook registered', data: webhook });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.vendorWebhook.delete({ where: { id: parseInt(id, 10) } });
    res.status(200).json({ success: true, message: 'Webhook deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
