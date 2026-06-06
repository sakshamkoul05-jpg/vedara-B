import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    guestName: z.string().min(2, 'Name is required'),
    guestEmail: z.string().email().optional().or(z.literal('')),
    guestPhone: z.string().min(5, 'Phone number is required'),
    cottageId: z.string().min(1, 'Cottage ID is required'),
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
    adults: z.union([z.number(), z.string()]).optional().default(2),
    children: z.union([z.number(), z.string()]).optional().default(0),
    specialRequests: z.string().optional(),
    source: z.string().optional(),
    couponCode: z.string().nullable().optional(),
    idProof: z.string().optional(),
    address: z.string().optional(),
  }),
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
    reason: z.string().optional(),
  }),
});
