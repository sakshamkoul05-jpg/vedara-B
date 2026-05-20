import { z } from 'zod';

export const updateSettingSchema = z.object({
  body: z.object({
    key: z.string().min(1),
    value: z.any(),
  }),
});

export const addGallerySchema = z.object({
  body: z.object({
    image: z.string().min(1, 'Image URL is required'),
    caption: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const addTestimonialSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().optional(),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    rating: z.number().int().min(1).max(5).optional(),
    image: z.string().optional(),
  }),
});

export const addFAQSchema = z.object({
  body: z.object({
    question: z.string().min(5, 'Question is required'),
    answer: z.string().min(10, 'Answer is required'),
    category: z.string().optional(),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3, 'Coupon code must be at least 3 characters'),
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FLAT']),
    discountValue: z.number().positive('Discount value must be positive'),
    minAmount: z.number().min(0).optional(),
    maxUsage: z.number().int().min(0).optional(),
    expiresAt: z.string().optional(),
  }),
});
