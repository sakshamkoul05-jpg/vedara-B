import { z } from 'zod';
import { sanitizedString, emailSchema } from './index';

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: sanitizedString(2, 100),
    email: emailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    role: z.enum(['SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST', 'ADMIN', 'STAFF']),
    phone: z.string().regex(/^[\d\s+\-()]{7,20}$/, 'Invalid phone').optional().or(z.literal('')),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: sanitizedString(2, 100).optional(),
    phone: z.string().regex(/^[\d\s+\-()]{7,20}$/, 'Invalid phone').optional().or(z.literal('')),
    role: z.enum(['SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST', 'ADMIN', 'STAFF']).optional(),
    isActive: z.boolean().optional(),
  }),
});
