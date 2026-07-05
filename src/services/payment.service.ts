import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      });
      return order;
    } catch (error: any) {
      console.error('Razorpay createOrder error:', error?.status, error?.error?.description || error?.message || error);
      throw new AppError(`Failed to create payment order: ${error?.error?.description || error?.message || 'unknown'}`, 500);
    }
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');
    if (expectedSignature.length !== signature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch {
      throw new AppError('Failed to fetch payment details', 500);
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        ...(amount && { amount: Math.round(amount * 100) }),
      });
      return refund;
    } catch {
      throw new AppError('Failed to process refund', 500);
    }
  }
}

export const paymentService = new PaymentService();
