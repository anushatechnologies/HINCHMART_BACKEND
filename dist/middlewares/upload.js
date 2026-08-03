"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: 'o571jfo7',
    api_key: '133869837249733',
    api_secret: 'ufERhfAC9WvtRoUqe8DIUCgeXug'
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'hinchi_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
//# sourceMappingURL=upload.js.map