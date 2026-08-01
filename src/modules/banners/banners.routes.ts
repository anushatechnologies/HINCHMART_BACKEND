import { Router } from 'express';
import { getBanners, createBanner, updateBanner, deleteBanner } from './banners.controller';
import { upload } from '../../middlewares/upload';

const router = Router();

router.get('/', getBanners);
// In a real app, POST, PUT, DELETE should be protected by Admin Middleware
router.post('/', upload.single('image'), createBanner);
router.put('/:id', upload.single('image'), updateBanner);
router.delete('/:id', deleteBanner);

export default router;
