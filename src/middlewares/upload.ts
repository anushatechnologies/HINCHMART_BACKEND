import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: 'o571jfo7',
  api_key: '133869837249733',
  api_secret: 'ufERhfAC9WvtRoUqe8DIUCgeXug'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hinchi_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  } as any,
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
