import { Router } from 'express';
import { paymentService } from '../services/payment.service';
import { AuthRequest } from '../types';
import { bookingLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('INR'),
  receipt: z.string().optional(),
});

const verifySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

const router = Router();

router.post('/create-order', bookingLimiter, async (req: AuthRequest, res: any, next) => {
  try {
    const { amount, currency, receipt } = createOrderSchema.parse(req.body);
    const order = await paymentService.createOrder(amount, currency, receipt);
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

export default router;
