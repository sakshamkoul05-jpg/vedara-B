import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { checkLockout } from '../middleware/accountLockout';
import { validate } from '../middleware/validate';
import { loginSchema, createUserSchema, updateUserSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', authLimiter, checkLockout, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.profile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/users', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), validate(createUserSchema), authController.createUser);
router.put('/users/:id', authenticate, authorize('SUPER_ADMIN'), validate(updateUserSchema), authController.updateUser);

export default router;
