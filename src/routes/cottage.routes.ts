import { Router } from 'express';
import { cottageController } from '../controllers/cottage.controller';

const router = Router();

router.get('/', cottageController.getAll);
router.get('/slug/:slug', cottageController.getBySlug);
router.get('/:id', cottageController.getById);

export default router;
