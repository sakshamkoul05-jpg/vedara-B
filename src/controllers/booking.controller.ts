import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { bookingService } from '../services/booking.service';
import { paymentService } from '../services/payment.service';

export const bookingController = {
  async checkAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cottageId, checkIn, checkOut } = req.query;
      const result = await bookingService.checkAvailability(
        cottageId as string, new Date(checkIn as string), new Date(checkOut as string)
      );
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  async getAvailableCottages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { checkIn, checkOut } = req.query;
      if (!checkIn || !checkOut) {
        return res.status(400).json({ success: false, error: 'Check-in and check-out dates required' });
      }
      const cottages = await bookingService.getAvailableCottages(
        new Date(checkIn as string), new Date(checkOut as string)
      );
      res.json({ success: true, data: cottages });
    } catch (error) { next(error); }
  },

  async createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { checkIn, checkOut, adults, children, ...rest } = req.body;

      const booking = await bookingService.createBooking({
        ...rest,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adults: parseInt(adults) || 2,
        children: parseInt(children) || 0,
        userId: req.user?.userId,
        source: req.body.source || 'WEBSITE',
      });

      const order = await paymentService.createOrder(booking.finalAmount, 'INR', booking.bookingRef);

      res.status(201).json({
        success: true,
        data: { booking, razorpayOrder: order },
      });
    } catch (error) { next(error); }
  },

  async confirmPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId, bookingRef, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

      const valid = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!valid) {
        return res.status(400).json({ success: false, error: 'Payment verification failed' });
      }

      const booking = await bookingService.confirmPayment(bookingId, {
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        signature: razorpaySignature,
        gateway: 'RAZORPAY',
      });

      res.json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  async getCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cottageId, month, year } = req.query;
      const calendar = await bookingService.getBookingCalendar(
        cottageId as string, parseInt(month as string), parseInt(year as string)
      );
      res.json({ success: true, data: calendar });
    } catch (error) { next(error); }
  },

  async approveBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.approveBooking(req.params.id, req.user?.userId);
      res.json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  async rejectBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const booking = await bookingService.rejectBooking(req.params.id, reason);
      res.json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const booking = await bookingService.cancelBooking(req.params.id as string, reason);
      res.json({ success: true, data: booking });
    } catch (error) { next(error); }
  },

  async getUserBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { phone, email } = req.query;
      if (!phone && !email) {
        return res.status(400).json({ success: false, error: 'Phone or email is required to look up bookings.' });
      }
      const bookings = await bookingService.getUserBookings(phone as string, email as string);
      res.json({ success: true, data: bookings });
    } catch (error) { next(error); }
  },

  async getAllBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await bookingService.getAllBookings({
        page, limit,
        status: req.query.status as string,
        search: req.query.search as string,
      });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }
      const booking = await bookingService.updateBookingStatus(req.params.id, status);
      res.json({ success: true, data: booking });
    } catch (error) { next(error); }
  },
};
