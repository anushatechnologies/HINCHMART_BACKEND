import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from './categories.controller';
import { upload } from '../../middlewares/upload';

const router = Router();

router.get('/', getCategories);
router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
