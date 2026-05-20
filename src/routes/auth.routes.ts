import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.profile);

router.post('/users', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), authController.createUser);
router.put('/users/:id', authenticate, authorize('SUPER_ADMIN'), authController.updateUser);

export default router;
