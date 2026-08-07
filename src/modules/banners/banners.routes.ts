import { Router } from 'express';
import { getBanners, createBanner, updateBanner, deleteBanner, toggleBannerStatus } from './banners.controller';
import { upload } from '../../middlewares/upload';

const router = Router();

router.get('/', getBanners);
router.post('/', upload.single('image'), createBanner);
router.put('/:id', upload.single('image'), updateBanner);
router.patch('/:id/toggle-status', toggleBannerStatus);
router.delete('/:id', deleteBanner);

export default router;
