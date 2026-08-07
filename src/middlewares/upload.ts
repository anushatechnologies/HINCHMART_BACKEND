import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Ensure local uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local Disk Storage Engine (for uploading files directly from local computer)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

export const uploadLocal = multer({
  storage: diskStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for local computer images & videos
});

// AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy_secret',
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || 'hinchmart-media-storage';

// AWS S3 Multer Storage Engine
const s3Storage = multerS3({
  s3: s3Client,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req: any, file: any, cb: any) {
    const folder = file.fieldname === 'document' ? 'documents' : file.fieldname === 'video' ? 'videos' : 'images';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${folder}/${uniqueSuffix}${ext}`);
  },
});

// Primary S3 Upload Middleware
export const upload = multer({
  storage: s3Storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default upload;
