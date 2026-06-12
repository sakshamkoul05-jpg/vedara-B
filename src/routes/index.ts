import { Router } from 'express';
import authRoutes from './auth.routes';
import bookingRoutes from './booking.routes';
import cottageRoutes from './cottage.routes';
import cafeRoutes from './cafe.routes';
import cmsRoutes from './cms.routes';
import chatbotRoutes from './chatbot.routes';
import contactRoutes from './contact.routes';
import paymentRoutes from './payment.routes';
import uploadRoutes from './upload.routes';
import chatRoutes from './chat.routes';
import prisma from '../config/database';
import { setCsrfCookie } from '../utils/security';

const router = Router();

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/cottages', cottageRoutes);
router.use('/cafe', cafeRoutes);
router.use('/cms', cmsRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/contact', contactRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);

router.get('/health', setCsrfCookie, (_req, res) => {
  res.json({ success: true, message: 'Vedara Retreat API is running', timestamp: new Date().toISOString() });
});

router.get('/packages/active', async (_req, res, next) => {
  try {
    const now = new Date();
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: packages });
  } catch (error) { next(error); }
});

export default router;
