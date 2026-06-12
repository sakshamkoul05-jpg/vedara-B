import { z } from 'zod';
import { sanitizedString, phoneSchema, emailSchema, dateSchema, positiveInt } from './index';

export const createBookingSchema = z.object({
  body: z.object({
    guestName: sanitizedString(2, 100),
    guestEmail: emailSchema.optional().or(z.literal('')),
    guestPhone: phoneSchema,
    cottageId: z.string().min(1, 'Cottage ID is required'),
    checkIn: dateSchema,
    checkOut: dateSchema,
    adults: positiveInt.optional().default(2),
    children: positiveInt.optional().default(0),
    specialRequests: sanitizedString(0, 2000).optional(),
    source: z.string().optional(),
    couponCode: z.string().max(50).nullable().optional(),
    idProof: sanitizedString(0, 100).optional(),
    address: sanitizedString(0, 500).optional(),
  }).refine(
    (data) => {
      if (!data.checkIn || !data.checkOut) return true;
      return new Date(data.checkOut) > new Date(data.checkIn);
    },
    { message: 'Check-out must be after check-in', path: ['checkOut'] }
  ),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    razorpayPaymentId: z.string().min(1),
    razorpayOrderId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: sanitizedString(0, 500).optional(),
  }),
});
