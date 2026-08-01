import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Images ───────────────────────────────────────────────────────────────────

export const getProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const images = await prisma.productImage.findMany({ where: { productId }, orderBy: { sortOrder: 'asc' } });
    res.status(200).json({ success: true, data: images });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { url, isPrimary, sortOrder } = req.body;

    if (!url) {
      res.status(400).json({ success: false, message: 'Image URL is required' });
      return;
    }

    // If setting as primary, unset all others first
    if (isPrimary) {
      await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    }

    const image = await prisma.productImage.create({
      data: { productId, url, isPrimary: !!isPrimary, sortOrder: sortOrder || 0 }
    });
    res.status(201).json({ success: true, data: image });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    await prisma.productImage.delete({ where: { id: imageId } });
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setPrimaryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const imageId = parseInt(req.params.imageId, 10);
    await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    await prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } });
    res.status(200).json({ success: true, message: 'Primary image updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Videos ───────────────────────────────────────────────────────────────────

export const getProductVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const videos = await prisma.productVideo.findMany({ where: { productId } });
    res.status(200).json({ success: true, data: videos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProductVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { url, title, type } = req.body;
    if (!url) {
      res.status(400).json({ success: false, message: 'Video URL is required' });
      return;
    }
    const video = await prisma.productVideo.create({ data: { productId, url, title, type: type || 'YOUTUBE' } });
    res.status(201).json({ success: true, data: video });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const videoId = parseInt(req.params.videoId, 10);
    await prisma.productVideo.delete({ where: { id: videoId } });
    res.status(200).json({ success: true, message: 'Video deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Documents ────────────────────────────────────────────────────────────────

export const getProductDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const docs = await prisma.productDocument.findMany({ where: { productId } });
    res.status(200).json({ success: true, data: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProductDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { url, title, type } = req.body;
    if (!url || !title) {
      res.status(400).json({ success: false, message: 'URL and title are required' });
      return;
    }
    const doc = await prisma.productDocument.create({ data: { productId, url, title, type: type || 'BROCHURE' } });
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = parseInt(req.params.docId, 10);
    await prisma.productDocument.delete({ where: { id: docId } });
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
