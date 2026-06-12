import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { contactSchema } from '../validators/contact.validator';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', contactLimiter, validate(contactSchema), contactController.submit);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), contactController.deleteMessage);

export default router;
