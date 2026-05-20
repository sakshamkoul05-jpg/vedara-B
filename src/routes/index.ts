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

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Vedara Retreat API is running', timestamp: new Date().toISOString() });
});

export default router;
