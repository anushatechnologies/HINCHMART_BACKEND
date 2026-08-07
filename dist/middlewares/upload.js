"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadLocal = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
// Ensure local uploads directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Local Disk Storage Engine (for uploading files directly from local computer)
const diskStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
exports.uploadLocal = (0, multer_1.default)({
    storage: diskStorage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for local computer images & videos
});
// AWS S3 Client
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy_key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy_secret',
    },
});
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'hinchmart-media-storage';
// AWS S3 Multer Storage Engine
const s3Storage = (0, multer_s3_1.default)({
    s3: s3Client,
    bucket: bucketName,
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        const folder = file.fieldname === 'document' ? 'documents' : file.fieldname === 'video' ? 'videos' : 'images';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${folder}/${uniqueSuffix}${ext}`);
    },
});
// Primary S3 Upload Middleware
exports.upload = (0, multer_1.default)({
    storage: s3Storage,
    limits: { fileSize: 100 * 1024 * 1024 },
});
exports.default = exports.upload;
//# sourceMappingURL=upload.js.map