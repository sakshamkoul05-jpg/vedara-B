import { Router } from 'express';
import { paymentService } from '../services/payment.service';
import { AuthRequest } from '../types';

const router = Router();

router.post('/create-order', async (req: AuthRequest, res: any, next) => {
  try {
    const { amount, currency, receipt } = req.body;
    const order = await paymentService.createOrder(amount, currency, receipt);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});

router.post('/verify', async (req: AuthRequest, res: any, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const valid = paymentService.verifyPayment(orderId, paymentId, signature);
    res.json({ success: true, data: { valid } });
  } catch (error) { next(error); }
});

export default router;
