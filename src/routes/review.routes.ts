import { Router } from 'express';
import { reviewService } from '../services/review.service';
import { authenticate, authorize } from '../middleware/auth';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const reviews = await reviewService.getAll();
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await reviewService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
});

router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const review = await reviewService.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
});

router.post('/:id/reply', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const review = await reviewService.reply(req.params.id, req.body.adminReply);
    res.json({ success: true, data: review });
  } catch (error) { next(error); }
});

router.put('/:id/visibility', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const review = await reviewService.toggleVisibility(req.params.id);
    res.json({ success: true, data: review });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    await reviewService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

export default router;
