import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', contactController.submit);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), contactController.deleteMessage);

export default router;
