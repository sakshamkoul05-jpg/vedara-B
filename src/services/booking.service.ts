import prisma from '../config/database';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { generateBookingRef, calculateNights, isDateOverlap } from '../utils/helpers';
import { emailService } from './email.service';
import { whatsappService } from './whatsapp.service';
import { paymentService } from './payment.service';

export class BookingService {
  async checkAvailability(cottageId: string, checkIn: Date, checkOut: Date) {
    const cottage = await prisma.cottage.findUnique({ where: { id: cottageId } });
    if (!cottage) throw new AppError('Cottage not found', 404);

    const nights = calculateNights(checkIn, checkOut);
    if (nights < 1) throw new AppError('Minimum stay is 1 night', 400);

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        cottageId,
        status: { in: ['PENDING', 'RESERVED', 'CONFIRMED'] },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        cottageId,
        date: { gte: checkIn, lt: checkOut },
      },
    });

    return {
      available: conflictingBookings.length === 0 && blockedDates.length === 0,
      conflictingBookings: conflictingBookings.length,
      blockedDates: blockedDates.length,
    };
  }

  async createBooking(data: {
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    cottageId: string;
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children?: number;
    specialRequests?: string;
    source?: string;
    userId?: string;
    couponCode?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const cottage = await tx.cottage.findUnique({ where: { id: data.cottageId } });
      if (!cottage) throw new AppError('Cottage not found', 404);

      const nights = calculateNights(data.checkIn, data.checkOut);
      if (nights < 1) throw new AppError('Invalid date range', 400);

      const existingBooking = await tx.booking.findFirst({
        where: {
          cottageId: data.cottageId,
          status: { in: ['PENDING', 'RESERVED', 'CONFIRMED'] },
          checkIn: { lt: data.checkOut },
          checkOut: { gt: data.checkIn },
        },
        select: { id: true },
      });

      if (existingBooking) {
        throw new AppError('Cottage is not available for the selected dates', 409);
      }

      const blockedDates = await tx.blockedDate.findFirst({
        where: {
          cottageId: data.cottageId,
          date: { gte: data.checkIn, lt: data.checkOut },
        },
      });

      if (blockedDates) {
        throw new AppError('Cottage is blocked for some of the selected dates', 409);
      }

      const seasonalPricing = await tx.seasonalPricing.findFirst({
        where: {
          cottageId: data.cottageId,
          startDate: { lte: data.checkOut },
          endDate: { gte: data.checkIn },
          isActive: true,
        },
        orderBy: { pricePerNight: 'desc' },
      });

      let pricePerNight = cottage.pricePerNight;
      let minStay = 1;

      if (seasonalPricing) {
        pricePerNight = seasonalPricing.pricePerNight;
        minStay = seasonalPricing.minStay;
      }

      if (nights < minStay) {
        throw new AppError(`Minimum stay for these dates is ${minStay} nights`, 400);
      }

      let totalAmount = pricePerNight * nights;
      let discount = 0;

      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: data.couponCode } });
        if (!coupon || !coupon.isActive) {
          throw new AppError('Invalid coupon code', 400);
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
          throw new AppError('Coupon has expired', 400);
        }
        if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
          throw new AppError('Coupon usage limit reached', 400);
        }
        if (totalAmount < coupon.minAmount) {
          throw new AppError(`Minimum order amount for this coupon is ₹${coupon.minAmount}`, 400);
        }

        discount = coupon.discountType === 'PERCENTAGE'
          ? (totalAmount * coupon.discountValue) / 100
          : coupon.discountValue;

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const amountAfterDiscount = Math.max(0, totalAmount - discount);
      const taxRate = 0.12;
      const tax = Math.round(amountAfterDiscount * taxRate);
      const finalAmount = amountAfterDiscount + tax;

      let guest = await tx.guest.findFirst({
        where: {
          OR: [
            ...(data.guestEmail ? [{ email: data.guestEmail }] : []),
            ...(data.guestPhone ? [{ phone: data.guestPhone }] : []),
          ],
        },
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            name: data.guestName,
            email: data.guestEmail,
            phone: data.guestPhone,
          },
        });
      }

      const holdExpiresAt = new Date(Date.now() + config.bookingHoldMinutes * 60 * 1000);

      const booking = await tx.booking.create({
        data: {
          bookingRef: generateBookingRef(),
          guestId: guest.id,
          cottageId: data.cottageId,
          userId: data.userId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          adults: data.adults,
          children: data.children || 0,
          totalAmount,
          discount,
          couponCode: data.couponCode,
          finalAmount,
          status: 'PENDING',
          holdExpiresAt,
          specialRequests: data.specialRequests,
          source: data.source || 'WEBSITE',
        },
        include: { cottage: true, guest: true },
      });

      return booking;
    });
  }

  async confirmPayment(bookingId: string, paymentData: {
    paymentId: string;
    orderId: string;
    signature: string;
    gateway: string;
    method?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { guest: true, cottage: true },
      });

      if (!booking) throw new AppError('Booking not found', 404);
      if (booking.status !== 'PENDING' && booking.status !== 'RESERVED') {
        throw new AppError('Booking cannot be confirmed', 400);
      }

      const conflicting = await tx.booking.findFirst({
        where: {
          cottageId: booking.cottageId,
          id: { not: booking.id },
          status: { in: ['PENDING', 'RESERVED', 'CONFIRMED'] },
          checkIn: { lt: booking.checkOut },
          checkOut: { gt: booking.checkIn },
        },
      });

      if (conflicting) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED', cancelReason: 'Availability conflict during payment processing' },
        });

        try {
          await paymentService.refundPayment(paymentData.paymentId, booking.finalAmount);
        } catch (refundError: any) {
          console.error('Refund failed for booking conflict:', booking.bookingRef, refundError?.message);
        }

        throw new AppError('Sorry, the cottage was booked by someone else. Your payment has been refunded.', 409);
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
      });

      await tx.payment.create({
        data: {
          bookingId,
          orderId: paymentData.orderId,
          paymentId: paymentData.paymentId,
          signature: paymentData.signature,
          amount: booking.finalAmount,
          status: 'PAID',
          gateway: paymentData.gateway as any,
          method: paymentData.method,
        },
      });

      // Guest email confirmation
      await emailService.sendBookingConfirmation(
        booking.guest.email || 'guest@vedara.com',
        booking.bookingRef,
        booking.guest.name,
        booking.cottage.name,
        booking.checkIn,
        booking.checkOut,
        booking.finalAmount
      );

      // Admin email alert
      await emailService.sendAdminBookingAlert(
        booking.bookingRef,
        booking.guest.name,
        booking.guest.email || '',
        booking.guest.phone || '',
        booking.cottage.name,
        booking.checkIn,
        booking.checkOut,
        booking.finalAmount
      );

      // WhatsApp alert to 9118882242
      await whatsappService.sendBookingAlert({
        bookingRef: booking.bookingRef,
        guestName: booking.guest.name,
        guestPhone: booking.guest.phone || 'N/A',
        cottageName: booking.cottage.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        amount: booking.finalAmount,
      });

      return { ...booking, status: 'CONFIRMED' };
    });
  }

  async getAvailableCottages(checkIn: Date, checkOut: Date) {
    const cottages = await prisma.cottage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const available: any[] = [];

    for (const cottage of cottages) {
      const conflicting = await prisma.booking.findFirst({
        where: {
          cottageId: cottage.id,
          status: { in: ['PENDING', 'RESERVED', 'CONFIRMED'] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      });

      const blocked = await prisma.blockedDate.findFirst({
        where: {
          cottageId: cottage.id,
          date: { gte: checkIn, lt: checkOut },
        },
      });

      available.push({
        ...cottage,
        isAvailable: !conflicting && !blocked,
      });
    }

    return available;
  }

  async getBookingCalendar(cottageId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        cottageId,
        status: { in: ['PENDING', 'RESERVED', 'CONFIRMED'] },
        checkIn: { lt: endDate },
        checkOut: { gt: startDate },
      },
      select: { checkIn: true, checkOut: true, status: true, bookingRef: true },
    });

    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        cottageId,
        date: { gte: startDate, lte: endDate },
      },
      select: { date: true, reason: true },
    });

    const calendar: Record<string, { status: string; bookingRef?: string }> = {};

    for (const booking of bookings) {
      let current = new Date(booking.checkIn);
      while (current < booking.checkOut && current <= endDate) {
        const key = current.toISOString().split('T')[0];
        if (current >= startDate) {
          calendar[key] = { status: booking.status.toLowerCase(), bookingRef: booking.bookingRef };
        }
        current.setDate(current.getDate() + 1);
      }
    }

    for (const bd of blockedDates) {
      const key = bd.date.toISOString().split('T')[0];
      calendar[key] = { status: 'blocked' };
    }

    return calendar;
  }

  async cancelBooking(bookingId: string, reason?: string) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
      include: { guest: true, cottage: true },
    });

    if (booking.guest.email) {
      await emailService.sendCancellationConfirmation(
        booking.guest.email,
        booking.bookingRef,
        booking.guest.name
      );
    }

    await whatsappService.sendCancellationAlert(
      booking.bookingRef,
      booking.guest.name,
      booking.cottage.name
    );

    return booking;
  }

  async getUserBookings(phone?: string, email?: string) {
    if (!phone && !email) throw new AppError('Phone or email required', 400);

    return prisma.booking.findMany({
      where: {
        guest: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
      },
      include: { cottage: true, guest: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllBookings(params: { page: number; limit: number; status?: string; search?: string }) {
    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { bookingRef: { contains: params.search, mode: 'insensitive' } },
        { guest: { name: { contains: params.search, mode: 'insensitive' } } },
        { guest: { email: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { cottage: true, guest: true, payment: true, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  }
}

export const bookingService = new BookingService();
