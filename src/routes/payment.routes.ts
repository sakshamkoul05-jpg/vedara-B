import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { bookingService } from '../services/booking.service';
import prisma from '../config/database';
import { config } from '../config';
import { AuthRequest } from '../types';
import { bookingLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.string()).optional(),
});

const verifySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

const router = Router();

// Public Razorpay key for frontend checkout initialization
router.get('/config', (_req: Request, res: Response) => {
  res.json({ success: true, data: { keyId: config.razorpay.keyId } });
});

router.post('/create-order', bookingLimiter, async (req: AuthRequest, res: any, next) => {
  try {
    const { amount, currency, receipt, notes } = createOrderSchema.parse(req.body);
    const order = await paymentService.createOrder(amount, currency, receipt, notes);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});

router.post('/verify', async (req: AuthRequest, res: any, next) => {
  try {
    const { orderId, paymentId, signature } = verifySchema.parse(req.body);
    const valid = paymentService.verifyPayment(orderId, paymentId, signature);
    res.json({ success: true, data: { valid } });
  } catch (error) { next(error); }
});

// Razorpay webhook: confirms bookings asynchronously when payments succeed
// even if the client-side confirmation call fails (e.g. tab closed).
router.post('/razorpay-webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody as Buffer;

    if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    const event = (req.body as any)?.event;
    const payload = (req.body as any)?.payload || {};
    const orderEntity = payload.order?.entity;
    const paymentEntity = payload.payment?.entity;

    const bookingRef: string | undefined =
      orderEntity?.receipt || paymentEntity?.notes?.bookingRef;

    if (bookingRef && (event === 'payment.captured' || event === 'order.paid')) {
      const booking = await prisma.booking.findUnique({ where: { bookingRef } });
      if (booking) {
        await bookingService.confirmPaymentWebhook(booking.id, {
          paymentId: paymentEntity?.id || orderEntity?.id || '',
          orderId: orderEntity?.id || paymentEntity?.order_id || '',
          gateway: 'RAZORPAY',
          method: paymentEntity?.method,
          amount: paymentEntity ? paymentEntity.amount / 100 : undefined,
        });
      }
    }

    if (event === 'payment.failed' && bookingRef) {
      const booking = await prisma.booking.findUnique({ where: { bookingRef } });
      if (booking && booking.status === 'PENDING') {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: 'FAILED' },
        });
      }
    }

    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
