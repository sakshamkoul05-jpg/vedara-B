import { Router } from 'express';
import { z } from 'zod';
import { reviewService } from '../services/review.service';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

const createReviewSchema = z.object({
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email().max(150).optional().or(z.literal('')),
  guestPhone: z.string().max(20).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().min(1).max(2000),
});

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
    const parsed = createReviewSchema.parse(req.body);

    let guest = await prisma.guest.findFirst({
      where: {
        OR: [
          ...(parsed.guestEmail ? [{ email: parsed.guestEmail }] : []),
          ...(parsed.guestPhone ? [{ phone: parsed.guestPhone }] : []),
        ],
      },
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: parsed.guestName,
          email: parsed.guestEmail || null,
          phone: parsed.guestPhone || null,
        },
      });
    }

    const review = await reviewService.create({
      guestId: guest.id,
      rating: parsed.rating,
      title: parsed.title,
      content: parsed.content,
      source: 'WEBSITE',
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid review data', errors: error.errors });
    }
    next(error);
  }
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
